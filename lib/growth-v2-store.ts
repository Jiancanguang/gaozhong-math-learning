import 'server-only';

import { buildTablePath, isSupabaseAdminEnabled, supabaseAdminRequest } from '@/lib/supabase-admin';

export type GrowthGroupStatus = 'active' | 'archived';
export type GrowthStudentStatus = 'active' | 'archived';

export type GrowthGroup = {
  id: string;
  name: string;
  subject: string;
  teacherName: string;
  gradeLabel: string;
  status: GrowthGroupStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type GrowthStudent = {
  id: string;
  name: string;
  gradeLabel: string;
  homeGroupId: string | null;
  parentAccessToken: string;
  status: GrowthStudentStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type GrowthStudentListItem = GrowthStudent & {
  homeGroup: GrowthGroup | null;
  lessonCount: number;
  examCount: number;
};

export type ListGrowthStudentsParams = {
  q?: string;
  groupId?: string;
  status?: 'all' | GrowthStudentStatus;
  gradeLabel?: string;
};

export type GrowthV2AdminSnapshot = {
  groupCount: number;
  studentCount: number;
  lessonCount: number;
  examCount: number;
};

type GrowthGroupRow = {
  id: string;
  name: string;
  subject: string;
  teacher_name: string | null;
  grade_label: string | null;
  status: GrowthGroupStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type GrowthStudentRow = {
  id: string;
  name: string;
  grade_label: string | null;
  home_group_id: string | null;
  parent_access_token: string;
  status: GrowthStudentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type StudentOnlyRow = {
  student_id: string;
};

const GROWTH_GROUPS_TABLE = 'growth_groups';
const GROWTH_STUDENTS_TABLE = 'growth_students';
const GROWTH_LESSONS_TABLE = 'growth_lessons';
const GROWTH_LESSON_RECORDS_TABLE = 'growth_lesson_records';
const GROWTH_EXAMS_TABLE = 'growth_exams';
const GROWTH_EXAM_SCORES_TABLE = 'growth_exam_scores';

function mapGrowthGroup(row: GrowthGroupRow): GrowthGroup {
  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    teacherName: row.teacher_name?.trim() ?? '',
    gradeLabel: row.grade_label?.trim() ?? '',
    status: row.status,
    notes: row.notes ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapGrowthStudent(row: GrowthStudentRow): GrowthStudent {
  return {
    id: row.id,
    name: row.name,
    gradeLabel: row.grade_label?.trim() ?? '',
    homeGroupId: row.home_group_id,
    parentAccessToken: row.parent_access_token,
    status: row.status,
    notes: row.notes ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function readRows<T>(path: string) {
  const response = await supabaseAdminRequest(path);
  if (!response) return [] as T[];
  return (await response.json()) as T[];
}

async function readCount(tableName: string) {
  const rows = await readRows<{ id: string }>(buildTablePath(tableName, new URLSearchParams({ select: 'id' }).toString()));
  return rows.length;
}

function buildStudentIdInFilter(studentIds: string[]) {
  return `in.(${studentIds.join(',')})`;
}

export function isGrowthV2StoreEnabled() {
  return isSupabaseAdminEnabled();
}

export function isGrowthV2TableMissingError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const schemaMarkers = [
    'PGRST205',
    'PGRST204',
    'schema cache',
    'does not exist',
    GROWTH_GROUPS_TABLE,
    GROWTH_STUDENTS_TABLE,
    GROWTH_LESSONS_TABLE,
    GROWTH_LESSON_RECORDS_TABLE,
    GROWTH_EXAMS_TABLE,
    GROWTH_EXAM_SCORES_TABLE,
    'parent_access_token',
    'home_group_id'
  ];

  return schemaMarkers.some((marker) => message.includes(marker));
}

export async function listGrowthGroups(params: { status?: 'all' | GrowthGroupStatus } = {}) {
  const query = new URLSearchParams({
    select: 'id,name,subject,teacher_name,grade_label,status,notes,created_at,updated_at',
    order: 'status.asc,name.asc'
  });

  if (params.status && params.status !== 'all') {
    query.set('status', `eq.${params.status}`);
  }

  const rows = await readRows<GrowthGroupRow>(buildTablePath(GROWTH_GROUPS_TABLE, query.toString()));
  return rows.map(mapGrowthGroup);
}

export async function listGrowthStudents(params: ListGrowthStudentsParams = {}): Promise<GrowthStudentListItem[]> {
  const query = new URLSearchParams({
    select: 'id,name,grade_label,home_group_id,parent_access_token,status,notes,created_at,updated_at',
    order: 'status.asc,name.asc'
  });

  if (params.q?.trim()) {
    query.set('name', `ilike.*${params.q.trim()}*`);
  }

  if (params.groupId?.trim()) {
    query.set('home_group_id', `eq.${params.groupId.trim()}`);
  }

  if (params.gradeLabel?.trim()) {
    query.set('grade_label', `eq.${params.gradeLabel.trim()}`);
  }

  if (params.status && params.status !== 'all') {
    query.set('status', `eq.${params.status}`);
  }

  const studentRows = await readRows<GrowthStudentRow>(buildTablePath(GROWTH_STUDENTS_TABLE, query.toString()));
  if (studentRows.length === 0) return [];

  const students = studentRows.map(mapGrowthStudent);
  const studentIds = students.map((student) => student.id);

  const [groups, lessonRecordRows, examScoreRows] = await Promise.all([
    listGrowthGroups({ status: 'all' }),
    readRows<StudentOnlyRow>(
      buildTablePath(
        GROWTH_LESSON_RECORDS_TABLE,
        new URLSearchParams({
          select: 'student_id',
          student_id: buildStudentIdInFilter(studentIds)
        }).toString()
      )
    ),
    readRows<StudentOnlyRow>(
      buildTablePath(
        GROWTH_EXAM_SCORES_TABLE,
        new URLSearchParams({
          select: 'student_id',
          student_id: buildStudentIdInFilter(studentIds)
        }).toString()
      )
    )
  ]);

  const groupMap = new Map(groups.map((group) => [group.id, group]));
  const lessonCounts = new Map<string, number>();
  const examCounts = new Map<string, number>();

  for (const row of lessonRecordRows) {
    lessonCounts.set(row.student_id, (lessonCounts.get(row.student_id) ?? 0) + 1);
  }

  for (const row of examScoreRows) {
    examCounts.set(row.student_id, (examCounts.get(row.student_id) ?? 0) + 1);
  }

  return students.map((student) => ({
    ...student,
    homeGroup: student.homeGroupId ? groupMap.get(student.homeGroupId) ?? null : null,
    lessonCount: lessonCounts.get(student.id) ?? 0,
    examCount: examCounts.get(student.id) ?? 0
  }));
}

export async function getGrowthV2AdminSnapshot(): Promise<GrowthV2AdminSnapshot> {
  const [groupCount, studentCount, lessonCount, examCount] = await Promise.all([
    readCount(GROWTH_GROUPS_TABLE),
    readCount(GROWTH_STUDENTS_TABLE),
    readCount(GROWTH_LESSONS_TABLE),
    readCount(GROWTH_EXAMS_TABLE)
  ]);

  return {
    groupCount,
    studentCount,
    lessonCount,
    examCount
  };
}

