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

export type GrowthLesson = {
  id: string;
  groupId: string;
  lessonDate: string;
  timeStart: string | null;
  timeEnd: string | null;
  topic: string;
  entryTestTopic: string;
  exitTestTopic: string;
  testTotal: number | null;
  homework: string;
  keyPoints: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type GrowthLessonRecord = {
  id: string;
  lessonId: string;
  studentId: string;
  isGuest: boolean;
  entryScore: number | null;
  exitScore: number | null;
  performance: number | null;
  masteryLevel: string | null;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

export type GrowthLessonListItem = GrowthLesson & {
  group: GrowthGroup | null;
  recordCount: number;
  guestCount: number;
  avgEntryScore: number | null;
  avgExitScoreRate: number | null;
  avgPerformance: number | null;
  masteryFilledCount: number;
};

export type GrowthLessonDetail = GrowthLesson & {
  group: GrowthGroup | null;
  records: Array<GrowthLessonRecord & { student: GrowthStudent | null }>;
};

export type ListGrowthLessonsParams = {
  q?: string;
  groupId?: string;
  page?: number;
  pageSize?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type GrowthExam = {
  id: string;
  groupId: string;
  name: string;
  examType: 'school' | 'internal' | 'other';
  examDate: string;
  subject: string;
  totalScore: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type GrowthExamScore = {
  id: string;
  examId: string;
  studentId: string;
  score: number;
  classRank: number | null;
  gradeRank: number | null;
  masteryLevel: string | null;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type GrowthExamScoreTag = {
  id: string;
  examScoreId: string;
  category: string;
  tagName: string;
  sortOrder: number;
  createdAt: string;
};

export type GrowthExamListItem = GrowthExam & {
  group: GrowthGroup | null;
  scoreCount: number;
  avgScore: number | null;
  avgScoreRate: number | null;
  maxScore: number | null;
  minScore: number | null;
  masteryFilledCount: number;
  topTags: Array<{ tagName: string; count: number }>;
};

export type GrowthExamDetail = GrowthExam & {
  group: GrowthGroup | null;
  scores: Array<GrowthExamScore & { student: GrowthStudent | null; tags: GrowthExamScoreTag[] }>;
};

export type ListGrowthExamsParams = {
  q?: string;
  groupId?: string;
  examType?: 'all' | 'school' | 'internal' | 'other';
  page?: number;
  pageSize?: number;
};

export type GrowthParentLessonItem = GrowthLessonRecord & {
  lesson: GrowthLesson;
  group: GrowthGroup | null;
  exitScoreRate: number | null;
};

export type GrowthParentExamItem = GrowthExamScore & {
  exam: GrowthExam;
  group: GrowthGroup | null;
  scoreRate: number | null;
  tags: GrowthExamScoreTag[];
};

export type GrowthParentReport = {
  student: GrowthStudent;
  homeGroup: GrowthGroup | null;
  lessonCount: number;
  examCount: number;
  avgExitScoreRate: number | null;
  avgPerformance: number | null;
  avgExamScoreRate: number | null;
  topWeakTags: Array<{ tagName: string; count: number }>;
  recentLessons: GrowthParentLessonItem[];
  recentExams: GrowthParentExamItem[];
};

export type CreateGrowthGroupInput = {
  name: string;
  subject?: string;
  teacherName?: string;
  gradeLabel?: string;
  status?: GrowthGroupStatus;
  notes?: string;
};

export type CreateGrowthStudentInput = {
  name: string;
  gradeLabel: string;
  homeGroupId?: string | null;
  parentAccessToken: string;
  status?: GrowthStudentStatus;
  notes?: string;
};

export type UpdateGrowthStudentInput = {
  name: string;
  gradeLabel: string;
  homeGroupId?: string | null;
  status?: GrowthStudentStatus;
  notes?: string;
};

export type CreateGrowthLessonInput = {
  groupId: string;
  lessonDate: string;
  timeStart?: string | null;
  timeEnd?: string | null;
  topic: string;
  entryTestTopic?: string;
  exitTestTopic?: string;
  testTotal?: number | null;
  homework?: string;
  keyPoints?: string;
  notes?: string;
};

export type SaveGrowthLessonRecordInput = {
  studentId: string;
  isGuest?: boolean;
  entryScore?: number | null;
  exitScore?: number | null;
  performance?: number | null;
  masteryLevel?: string | null;
  comment?: string;
};

export type GrowthTagCatalogItem = {
  id: string;
  scope: 'exam';
  category: string;
  tagName: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

export type GrowthTagCatalogSummaryItem = GrowthTagCatalogItem & {
  usageCount: number;
};

export type CreateGrowthTagCatalogInput = {
  scope?: 'exam';
  category: string;
  tagName: string;
  sortOrder?: number | null;
  isActive?: boolean;
};

export type CreateGrowthExamInput = {
  groupId: string;
  name: string;
  examType: 'school' | 'internal' | 'other';
  examDate: string;
  subject?: string;
  totalScore: number;
  notes?: string;
};

export type SaveGrowthExamScoreInput = {
  studentId: string;
  score?: number | null;
  classRank?: number | null;
  gradeRank?: number | null;
  masteryLevel?: string | null;
  note?: string;
  tagNames?: string[];
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

type GrowthLessonRow = {
  id: string;
  group_id: string;
  lesson_date: string;
  time_start: string | null;
  time_end: string | null;
  topic: string;
  entry_test_topic: string | null;
  exit_test_topic: string | null;
  test_total: number | string | null;
  homework: string | null;
  key_points: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type GrowthLessonRecordRow = {
  id: string;
  lesson_id: string;
  student_id: string;
  is_guest: boolean | null;
  entry_score: number | string | null;
  exit_score: number | string | null;
  performance: number | string | null;
  mastery_level: string | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

type LessonOnlyRow = {
  lesson_id: string;
};

type GrowthExamRow = {
  id: string;
  group_id: string;
  name: string;
  exam_type: 'school' | 'internal' | 'other';
  exam_date: string;
  subject: string | null;
  total_score: number | string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type GrowthExamScoreRow = {
  id: string;
  exam_id: string;
  student_id: string;
  score: number | string;
  class_rank: number | string | null;
  grade_rank: number | string | null;
  mastery_level: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

type GrowthExamScoreTagRow = {
  id: string;
  exam_score_id: string;
  category: string | null;
  tag_name: string;
  sort_order: number | string | null;
  created_at: string;
};

type GrowthTagCatalogRow = {
  id: string;
  scope: 'exam';
  category: string;
  tag_name: string;
  sort_order: number | string | null;
  is_active: boolean;
  created_at: string;
};

type ExamOnlyRow = {
  exam_id: string;
};

type ExamScoreOnlyRow = {
  exam_score_id: string;
};

const GROWTH_GROUPS_TABLE = 'growth_groups';
const GROWTH_STUDENTS_TABLE = 'growth_students';
const GROWTH_LESSONS_TABLE = 'growth_lessons';
const GROWTH_LESSON_RECORDS_TABLE = 'growth_lesson_records';
const GROWTH_EXAMS_TABLE = 'growth_exams';
const GROWTH_EXAM_SCORES_TABLE = 'growth_exam_scores';
const GROWTH_EXAM_SCORE_TAGS_TABLE = 'growth_exam_score_tags';
const GROWTH_TAG_CATALOG_TABLE = 'growth_tag_catalog';
const GROWTH_MASTERY_LEVELS = ['lv985', 'lvtk', 'lveb', 'lvbk', 'lvzk'] as const;

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toInteger(value: number | string | null | undefined) {
  const parsed = toNumber(value);
  return parsed === null ? null : Math.trunc(parsed);
}

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

function mapGrowthLesson(row: GrowthLessonRow): GrowthLesson {
  return {
    id: row.id,
    groupId: row.group_id,
    lessonDate: row.lesson_date,
    timeStart: row.time_start,
    timeEnd: row.time_end,
    topic: row.topic,
    entryTestTopic: row.entry_test_topic ?? '',
    exitTestTopic: row.exit_test_topic ?? '',
    testTotal: toNumber(row.test_total),
    homework: row.homework ?? '',
    keyPoints: row.key_points ?? '',
    notes: row.notes ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapGrowthLessonRecord(row: GrowthLessonRecordRow): GrowthLessonRecord {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    studentId: row.student_id,
    isGuest: row.is_guest ?? false,
    entryScore: toNumber(row.entry_score),
    exitScore: toNumber(row.exit_score),
    performance: toInteger(row.performance),
    masteryLevel: row.mastery_level,
    comment: row.comment ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapGrowthExam(row: GrowthExamRow): GrowthExam {
  return {
    id: row.id,
    groupId: row.group_id,
    name: row.name,
    examType: row.exam_type,
    examDate: row.exam_date,
    subject: row.subject ?? '数学',
    totalScore: toNumber(row.total_score) ?? 0,
    notes: row.notes ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapGrowthExamScore(row: GrowthExamScoreRow): GrowthExamScore {
  return {
    id: row.id,
    examId: row.exam_id,
    studentId: row.student_id,
    score: toNumber(row.score) ?? 0,
    classRank: toInteger(row.class_rank),
    gradeRank: toInteger(row.grade_rank),
    masteryLevel: row.mastery_level,
    note: row.note ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapGrowthExamScoreTag(row: GrowthExamScoreTagRow): GrowthExamScoreTag {
  return {
    id: row.id,
    examScoreId: row.exam_score_id,
    category: row.category ?? '',
    tagName: row.tag_name,
    sortOrder: toInteger(row.sort_order) ?? 0,
    createdAt: row.created_at
  };
}

function mapGrowthTagCatalog(row: GrowthTagCatalogRow): GrowthTagCatalogItem {
  return {
    id: row.id,
    scope: row.scope,
    category: row.category,
    tagName: row.tag_name,
    sortOrder: toInteger(row.sort_order) ?? 0,
    isActive: row.is_active,
    createdAt: row.created_at
  };
}

async function readRows<T>(path: string) {
  const response = await supabaseAdminRequest(path);
  if (!response) return [] as T[];
  return (await response.json()) as T[];
}

async function readRowsWithCount<T>(path: string): Promise<{ rows: T[]; total: number }> {
  const response = await supabaseAdminRequest(path, {
    headers: { Prefer: 'count=exact' }
  });
  if (!response) return { rows: [], total: 0 };
  const rows = (await response.json()) as T[];
  const range = response.headers.get('content-range');
  const total = range ? parseInt(range.split('/')[1] ?? '0', 10) : rows.length;
  return { rows, total: Number.isFinite(total) ? total : rows.length };
}

async function readCount(tableName: string) {
  const rows = await readRows<{ id: string }>(buildTablePath(tableName, new URLSearchParams({ select: 'id' }).toString()));
  return rows.length;
}

function buildInFilter(ids: string[]) {
  return `in.(${ids.join(',')})`;
}

function compareDateDesc(left: string, right: string) {
  return new Date(right).getTime() - new Date(left).getTime();
}

export function isGrowthV2MasteryLevel(value: string | null | undefined): value is (typeof GROWTH_MASTERY_LEVELS)[number] {
  return (GROWTH_MASTERY_LEVELS as readonly string[]).includes(value ?? '');
}

async function readGrowthStudentsByIds(studentIds: string[]) {
  if (studentIds.length === 0) {
    return new Map<string, GrowthStudent>();
  }

  const rows = await readRows<GrowthStudentRow>(
    buildTablePath(
      GROWTH_STUDENTS_TABLE,
      new URLSearchParams({
        select: 'id,name,grade_label,home_group_id,parent_access_token,status,notes,created_at,updated_at',
        id: buildInFilter(studentIds)
      }).toString()
    )
  );

  return new Map(rows.map(mapGrowthStudent).map((student) => [student.id, student]));
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

export async function getGrowthGroupById(groupId: string): Promise<GrowthGroup | null> {
  const normalizedGroupId = groupId.trim();
  if (!normalizedGroupId) return null;

  const rows = await readRows<GrowthGroupRow>(
    buildTablePath(
      GROWTH_GROUPS_TABLE,
      new URLSearchParams({
        select: 'id,name,subject,teacher_name,grade_label,status,notes,created_at,updated_at',
        id: `eq.${normalizedGroupId}`,
        limit: '1'
      }).toString()
    )
  );

  if (rows.length === 0) return null;
  return mapGrowthGroup(rows[0]);
}

export async function createGrowthGroup(input: CreateGrowthGroupInput): Promise<GrowthGroup> {
  const response = await supabaseAdminRequest(buildTablePath(GROWTH_GROUPS_TABLE), {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      name: input.name.trim(),
      subject: input.subject?.trim() || 'math',
      teacher_name: input.teacherName?.trim() ?? '',
      grade_label: input.gradeLabel?.trim() ?? '',
      status: input.status ?? 'active',
      notes: input.notes?.trim() ?? ''
    })
  });

  if (!response) {
    throw new Error('Supabase admin is not configured.');
  }

  const rows = (await response.json()) as GrowthGroupRow[];
  return mapGrowthGroup(rows[0]);
}

export async function updateGrowthGroup(groupId: string, input: CreateGrowthGroupInput): Promise<GrowthGroup> {
  const query = new URLSearchParams({ id: `eq.${groupId}` });
  const response = await supabaseAdminRequest(buildTablePath(GROWTH_GROUPS_TABLE, query.toString()), {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      name: input.name.trim(),
      subject: input.subject?.trim() || 'math',
      teacher_name: input.teacherName?.trim() ?? '',
      grade_label: input.gradeLabel?.trim() ?? '',
      status: input.status ?? 'active',
      notes: input.notes?.trim() ?? ''
    })
  });

  if (!response) {
    throw new Error('Supabase admin is not configured.');
  }

  const rows = (await response.json()) as GrowthGroupRow[];
  return mapGrowthGroup(rows[0]);
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
          student_id: buildInFilter(studentIds)
        }).toString()
      )
    ),
    readRows<StudentOnlyRow>(
      buildTablePath(
        GROWTH_EXAM_SCORES_TABLE,
        new URLSearchParams({
          select: 'student_id',
          student_id: buildInFilter(studentIds)
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

export async function getGrowthStudentById(studentId: string): Promise<GrowthStudent | null> {
  const normalizedStudentId = studentId.trim();
  if (!normalizedStudentId) return null;

  const rows = await readRows<GrowthStudentRow>(
    buildTablePath(
      GROWTH_STUDENTS_TABLE,
      new URLSearchParams({
        select: 'id,name,grade_label,home_group_id,parent_access_token,status,notes,created_at,updated_at',
        id: `eq.${normalizedStudentId}`,
        limit: '1'
      }).toString()
    )
  );

  if (rows.length === 0) return null;
  return mapGrowthStudent(rows[0]);
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

export type GroupCountSummary = { lessonCounts: Map<string, number>; examCounts: Map<string, number> };

export async function getGrowthGroupCountSummary(): Promise<GroupCountSummary> {
  type GroupIdRow = { group_id: string };

  const [lessonRows, examRows] = await Promise.all([
    readRows<GroupIdRow>(buildTablePath(GROWTH_LESSONS_TABLE, new URLSearchParams({ select: 'group_id' }).toString())),
    readRows<GroupIdRow>(buildTablePath(GROWTH_EXAMS_TABLE, new URLSearchParams({ select: 'group_id' }).toString()))
  ]);

  const lessonCounts = new Map<string, number>();
  const examCounts = new Map<string, number>();

  for (const row of lessonRows) {
    lessonCounts.set(row.group_id, (lessonCounts.get(row.group_id) ?? 0) + 1);
  }

  for (const row of examRows) {
    examCounts.set(row.group_id, (examCounts.get(row.group_id) ?? 0) + 1);
  }

  return { lessonCounts, examCounts };
}

export async function createGrowthStudent(input: CreateGrowthStudentInput): Promise<GrowthStudent> {
  const response = await supabaseAdminRequest(buildTablePath(GROWTH_STUDENTS_TABLE), {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      name: input.name.trim(),
      grade_label: input.gradeLabel.trim(),
      home_group_id: input.homeGroupId?.trim() || null,
      parent_access_token: input.parentAccessToken.trim(),
      status: input.status ?? 'active',
      notes: input.notes?.trim() ?? ''
    })
  });

  if (!response) {
    throw new Error('Supabase admin is not configured.');
  }

  const rows = (await response.json()) as GrowthStudentRow[];
  return mapGrowthStudent(rows[0]);
}

export async function updateGrowthStudent(studentId: string, input: UpdateGrowthStudentInput): Promise<GrowthStudent> {
  const query = new URLSearchParams({ id: `eq.${studentId}` });
  const response = await supabaseAdminRequest(buildTablePath(GROWTH_STUDENTS_TABLE, query.toString()), {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      name: input.name.trim(),
      grade_label: input.gradeLabel.trim(),
      home_group_id: input.homeGroupId?.trim() || null,
      status: input.status ?? 'active',
      notes: input.notes?.trim() ?? ''
    })
  });

  if (!response) {
    throw new Error('Supabase admin is not configured.');
  }

  const rows = (await response.json()) as GrowthStudentRow[];
  return mapGrowthStudent(rows[0]);
}

export async function createGrowthLesson(input: CreateGrowthLessonInput): Promise<GrowthLesson> {
  const response = await supabaseAdminRequest(buildTablePath(GROWTH_LESSONS_TABLE), {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      group_id: input.groupId,
      lesson_date: input.lessonDate,
      time_start: input.timeStart?.trim() || null,
      time_end: input.timeEnd?.trim() || null,
      topic: input.topic.trim(),
      entry_test_topic: input.entryTestTopic?.trim() ?? '',
      exit_test_topic: input.exitTestTopic?.trim() ?? '',
      test_total: input.testTotal ?? null,
      homework: input.homework?.trim() ?? '',
      key_points: input.keyPoints?.trim() ?? '',
      notes: input.notes?.trim() ?? ''
    })
  });

  if (!response) {
    throw new Error('Supabase admin is not configured.');
  }

  const rows = (await response.json()) as GrowthLessonRow[];
  return mapGrowthLesson(rows[0]);
}

export async function updateGrowthLesson(lessonId: string, input: CreateGrowthLessonInput): Promise<GrowthLesson> {
  const query = new URLSearchParams({ id: `eq.${lessonId}` });
  const response = await supabaseAdminRequest(buildTablePath(GROWTH_LESSONS_TABLE, query.toString()), {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      group_id: input.groupId,
      lesson_date: input.lessonDate,
      time_start: input.timeStart?.trim() || null,
      time_end: input.timeEnd?.trim() || null,
      topic: input.topic.trim(),
      entry_test_topic: input.entryTestTopic?.trim() ?? '',
      exit_test_topic: input.exitTestTopic?.trim() ?? '',
      test_total: input.testTotal ?? null,
      homework: input.homework?.trim() ?? '',
      key_points: input.keyPoints?.trim() ?? '',
      notes: input.notes?.trim() ?? ''
    })
  });

  if (!response) {
    throw new Error('Supabase admin is not configured.');
  }

  const rows = (await response.json()) as GrowthLessonRow[];
  return mapGrowthLesson(rows[0]);
}

export async function deleteGrowthLesson(lessonId: string): Promise<void> {
  const response = await supabaseAdminRequest(buildTablePath(GROWTH_LESSONS_TABLE, new URLSearchParams({ id: `eq.${lessonId}` }).toString()), {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' }
  });

  if (!response) {
    throw new Error('Supabase admin is not configured.');
  }
}

export async function replaceGrowthLessonRecords(lessonId: string, records: SaveGrowthLessonRecordInput[]): Promise<void> {
  if (!lessonId) {
    throw new Error('lessonId is required.');
  }

  const deleteQuery = new URLSearchParams({ lesson_id: `eq.${lessonId}` });
  const deleteResponse = await supabaseAdminRequest(buildTablePath(GROWTH_LESSON_RECORDS_TABLE, deleteQuery.toString()), {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' }
  });

  if (!deleteResponse) {
    throw new Error('Supabase admin is not configured.');
  }

  const validRecords = records.filter((record) => {
    return (
      record.entryScore !== null && record.entryScore !== undefined ||
      record.exitScore !== null && record.exitScore !== undefined ||
      record.performance !== null && record.performance !== undefined ||
      Boolean(record.masteryLevel) ||
      Boolean(record.comment?.trim())
    );
  });

  if (validRecords.length === 0) {
    return;
  }

  const response = await supabaseAdminRequest(buildTablePath(GROWTH_LESSON_RECORDS_TABLE), {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(
      validRecords.map((record) => ({
        lesson_id: lessonId,
        student_id: record.studentId,
        is_guest: Boolean(record.isGuest),
        entry_score: record.entryScore ?? null,
        exit_score: record.exitScore ?? null,
        performance: record.performance ?? null,
        mastery_level: record.masteryLevel ?? null,
        comment: record.comment?.trim() ?? ''
      }))
    )
  });

  if (!response) {
    throw new Error('Supabase admin is not configured.');
  }
}

export async function listGrowthTagCatalog(): Promise<GrowthTagCatalogItem[]> {
  return listGrowthTagCatalogItems();
}

export async function listGrowthTagCatalogItems(params: { includeInactive?: boolean } = {}): Promise<GrowthTagCatalogItem[]> {
  const query = new URLSearchParams({
    select: 'id,scope,category,tag_name,sort_order,is_active,created_at',
    scope: 'eq.exam',
    order: 'category.asc,sort_order.asc,tag_name.asc'
  });

  if (!params.includeInactive) {
    query.set('is_active', 'eq.true');
  }

  const rows = await readRows<GrowthTagCatalogRow>(
    buildTablePath(GROWTH_TAG_CATALOG_TABLE, query.toString())
  );

  return rows.map(mapGrowthTagCatalog);
}

export async function listGrowthTagCatalogSummary(params: { includeInactive?: boolean } = {}): Promise<GrowthTagCatalogSummaryItem[]> {
  const [catalog, usageRows] = await Promise.all([
    listGrowthTagCatalogItems(params),
    readRows<GrowthExamScoreTagRow>(
      buildTablePath(
        GROWTH_EXAM_SCORE_TAGS_TABLE,
        new URLSearchParams({
          select: 'id,exam_score_id,category,tag_name,sort_order,created_at'
        }).toString()
      )
    )
  ]);

  const usageMap = new Map<string, number>();

  for (const row of usageRows) {
    const key = `${row.category ?? ''}::${row.tag_name}`;
    usageMap.set(key, (usageMap.get(key) ?? 0) + 1);
  }

  return catalog.map((item) => ({
    ...item,
    usageCount: usageMap.get(`${item.category}::${item.tagName}`) ?? 0
  }));
}

export async function getGrowthTagCatalogItemById(tagId: string): Promise<GrowthTagCatalogItem | null> {
  const normalizedTagId = tagId.trim();
  if (!normalizedTagId) return null;

  const rows = await readRows<GrowthTagCatalogRow>(
    buildTablePath(
      GROWTH_TAG_CATALOG_TABLE,
      new URLSearchParams({
        select: 'id,scope,category,tag_name,sort_order,is_active,created_at',
        id: `eq.${normalizedTagId}`,
        limit: '1'
      }).toString()
    )
  );

  if (rows.length === 0) return null;
  return mapGrowthTagCatalog(rows[0]);
}

export async function createGrowthTagCatalogItem(input: CreateGrowthTagCatalogInput): Promise<GrowthTagCatalogItem> {
  const response = await supabaseAdminRequest(buildTablePath(GROWTH_TAG_CATALOG_TABLE), {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      scope: input.scope ?? 'exam',
      category: input.category.trim(),
      tag_name: input.tagName.trim(),
      sort_order: input.sortOrder ?? 0,
      is_active: input.isActive ?? true
    })
  });

  if (!response) {
    throw new Error('Supabase admin is not configured.');
  }

  const rows = (await response.json()) as GrowthTagCatalogRow[];
  return mapGrowthTagCatalog(rows[0]);
}

export async function updateGrowthTagCatalogItem(tagId: string, input: CreateGrowthTagCatalogInput): Promise<GrowthTagCatalogItem> {
  const response = await supabaseAdminRequest(buildTablePath(GROWTH_TAG_CATALOG_TABLE, new URLSearchParams({ id: `eq.${tagId}` }).toString()), {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      scope: input.scope ?? 'exam',
      category: input.category.trim(),
      tag_name: input.tagName.trim(),
      sort_order: input.sortOrder ?? 0,
      is_active: input.isActive ?? true
    })
  });

  if (!response) {
    throw new Error('Supabase admin is not configured.');
  }

  const rows = (await response.json()) as GrowthTagCatalogRow[];
  return mapGrowthTagCatalog(rows[0]);
}

export async function createGrowthExam(input: CreateGrowthExamInput): Promise<GrowthExam> {
  const response = await supabaseAdminRequest(buildTablePath(GROWTH_EXAMS_TABLE), {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      group_id: input.groupId,
      name: input.name.trim(),
      exam_type: input.examType,
      exam_date: input.examDate,
      subject: input.subject?.trim() || '数学',
      total_score: input.totalScore,
      notes: input.notes?.trim() ?? ''
    })
  });

  if (!response) {
    throw new Error('Supabase admin is not configured.');
  }

  const rows = (await response.json()) as GrowthExamRow[];
  return mapGrowthExam(rows[0]);
}

export async function updateGrowthExam(examId: string, input: CreateGrowthExamInput): Promise<GrowthExam> {
  const query = new URLSearchParams({ id: `eq.${examId}` });
  const response = await supabaseAdminRequest(buildTablePath(GROWTH_EXAMS_TABLE, query.toString()), {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      group_id: input.groupId,
      name: input.name.trim(),
      exam_type: input.examType,
      exam_date: input.examDate,
      subject: input.subject?.trim() || '数学',
      total_score: input.totalScore,
      notes: input.notes?.trim() ?? ''
    })
  });

  if (!response) {
    throw new Error('Supabase admin is not configured.');
  }

  const rows = (await response.json()) as GrowthExamRow[];
  return mapGrowthExam(rows[0]);
}

export async function deleteGrowthExam(examId: string): Promise<void> {
  const response = await supabaseAdminRequest(buildTablePath(GROWTH_EXAMS_TABLE, new URLSearchParams({ id: `eq.${examId}` }).toString()), {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' }
  });

  if (!response) {
    throw new Error('Supabase admin is not configured.');
  }
}

export async function replaceGrowthExamScores(examId: string, scores: SaveGrowthExamScoreInput[]): Promise<void> {
  if (!examId) {
    throw new Error('examId is required.');
  }

  const deleteQuery = new URLSearchParams({ exam_id: `eq.${examId}` });
  const deleteResponse = await supabaseAdminRequest(buildTablePath(GROWTH_EXAM_SCORES_TABLE, deleteQuery.toString()), {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' }
  });

  if (!deleteResponse) {
    throw new Error('Supabase admin is not configured.');
  }

  const validScores = scores
    .map((score) => ({
      ...score,
      tagNames: [...new Set((score.tagNames ?? []).map((tagName) => tagName.trim()).filter(Boolean))]
    }))
    .filter((score) => score.score !== null && score.score !== undefined);

  if (validScores.length === 0) {
    return;
  }

  const scoreResponse = await supabaseAdminRequest(buildTablePath(GROWTH_EXAM_SCORES_TABLE), {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(
      validScores.map((score) => ({
        exam_id: examId,
        student_id: score.studentId,
        score: score.score,
        class_rank: score.classRank ?? null,
        grade_rank: score.gradeRank ?? null,
        mastery_level: score.masteryLevel ?? null,
        note: score.note?.trim() ?? ''
      }))
    )
  });

  if (!scoreResponse) {
    throw new Error('Supabase admin is not configured.');
  }

  const createdScoreRows = (await scoreResponse.json()) as GrowthExamScoreRow[];
  const createdScores = createdScoreRows.map(mapGrowthExamScore);
  const tagCatalog = await listGrowthTagCatalog();
  const tagCatalogMap = new Map(tagCatalog.map((tag) => [tag.tagName, tag]));
  const scoreIdByStudentId = new Map(createdScores.map((score) => [score.studentId, score.id]));

  const tagPayload = validScores.flatMap((score) => {
    const examScoreId = scoreIdByStudentId.get(score.studentId);
    if (!examScoreId) return [];

    return (score.tagNames ?? []).map((tagName, index) => {
      const catalogItem = tagCatalogMap.get(tagName);
      return {
        exam_score_id: examScoreId,
        category: catalogItem?.category ?? '',
        tag_name: tagName,
        sort_order: catalogItem?.sortOrder ?? (index + 1) * 10
      };
    });
  });

  if (tagPayload.length === 0) {
    return;
  }

  const tagResponse = await supabaseAdminRequest(buildTablePath(GROWTH_EXAM_SCORE_TAGS_TABLE), {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(tagPayload)
  });

  if (!tagResponse) {
    throw new Error('Supabase admin is not configured.');
  }
}

export async function listGrowthLessons(params: ListGrowthLessonsParams = {}): Promise<PaginatedResult<GrowthLessonListItem>> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.max(1, Math.min(100, params.pageSize ?? 20));
  const offset = (page - 1) * pageSize;

  const query = new URLSearchParams({
    select: 'id,group_id,lesson_date,time_start,time_end,topic,entry_test_topic,exit_test_topic,test_total,homework,key_points,notes,created_at,updated_at',
    order: 'lesson_date.desc,created_at.desc',
    limit: String(pageSize),
    offset: String(offset)
  });

  if (params.q?.trim()) {
    query.set('topic', `ilike.*${params.q.trim()}*`);
  }

  if (params.groupId?.trim()) {
    query.set('group_id', `eq.${params.groupId.trim()}`);
  }

  const { rows: lessonRows, total } = await readRowsWithCount<GrowthLessonRow>(buildTablePath(GROWTH_LESSONS_TABLE, query.toString()));
  if (lessonRows.length === 0) return { items: [], total, page, pageSize };

  const lessons = lessonRows.map(mapGrowthLesson);
  const lessonIds = lessons.map((lesson) => lesson.id);

  const [groups, lessonRecordRows] = await Promise.all([
    listGrowthGroups({ status: 'all' }),
    readRows<GrowthLessonRecordRow>(
      buildTablePath(
        GROWTH_LESSON_RECORDS_TABLE,
        new URLSearchParams({
          select: 'id,lesson_id,student_id,is_guest,entry_score,exit_score,performance,mastery_level,comment,created_at,updated_at',
          lesson_id: buildInFilter(lessonIds)
        }).toString()
      )
    )
  ]);

  const groupMap = new Map(groups.map((group) => [group.id, group]));
  const recordMap = new Map<string, GrowthLessonRecord[]>();

  for (const row of lessonRecordRows) {
    const record = mapGrowthLessonRecord(row);
    const current = recordMap.get(record.lessonId) ?? [];
    current.push(record);
    recordMap.set(record.lessonId, current);
  }

  const items = lessons.map((lesson) => {
    const records = recordMap.get(lesson.id) ?? [];
    const entryScores = records.flatMap((record) => (record.entryScore === null ? [] : [record.entryScore]));
    const exitRates = records.flatMap((record) => {
      if (record.exitScore === null || lesson.testTotal === null || lesson.testTotal <= 0) return [];
      return [(record.exitScore / lesson.testTotal) * 100];
    });
    const performanceValues = records.flatMap((record) => (record.performance === null ? [] : [record.performance]));

    return {
      ...lesson,
      group: groupMap.get(lesson.groupId) ?? null,
      recordCount: records.length,
      guestCount: records.filter((record) => record.isGuest).length,
      avgEntryScore: entryScores.length ? entryScores.reduce((sum, value) => sum + value, 0) / entryScores.length : null,
      avgExitScoreRate: exitRates.length ? exitRates.reduce((sum, value) => sum + value, 0) / exitRates.length : null,
      avgPerformance: performanceValues.length ? performanceValues.reduce((sum, value) => sum + value, 0) / performanceValues.length : null,
      masteryFilledCount: records.filter((record) => Boolean(record.masteryLevel)).length
    };
  });

  return { items, total, page, pageSize };
}

export async function getGrowthLessonDetailById(lessonId: string): Promise<GrowthLessonDetail | null> {
  const normalizedLessonId = lessonId.trim();
  if (!normalizedLessonId) return null;

  const lessonRows = await readRows<GrowthLessonRow>(
    buildTablePath(
      GROWTH_LESSONS_TABLE,
      new URLSearchParams({
        select: 'id,group_id,lesson_date,time_start,time_end,topic,entry_test_topic,exit_test_topic,test_total,homework,key_points,notes,created_at,updated_at',
        id: `eq.${normalizedLessonId}`,
        limit: '1'
      }).toString()
    )
  );

  const lessonRow = lessonRows[0];
  if (!lessonRow) return null;

  const lesson = mapGrowthLesson(lessonRow);
  const [groups, recordRows] = await Promise.all([
    listGrowthGroups({ status: 'all' }),
    readRows<GrowthLessonRecordRow>(
      buildTablePath(
        GROWTH_LESSON_RECORDS_TABLE,
        new URLSearchParams({
          select: 'id,lesson_id,student_id,is_guest,entry_score,exit_score,performance,mastery_level,comment,created_at,updated_at',
          lesson_id: `eq.${normalizedLessonId}`,
          order: 'created_at.asc'
        }).toString()
      )
    )
  ]);

  const records = recordRows.map(mapGrowthLessonRecord);
  const studentMap = await readGrowthStudentsByIds([...new Set(records.map((record) => record.studentId))]);
  const groupMap = new Map(groups.map((group) => [group.id, group]));

  return {
    ...lesson,
    group: groupMap.get(lesson.groupId) ?? null,
    records: records.map((record) => ({
      ...record,
      student: studentMap.get(record.studentId) ?? null
    }))
  };
}

export async function listGrowthExams(params: ListGrowthExamsParams = {}): Promise<PaginatedResult<GrowthExamListItem>> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.max(1, Math.min(100, params.pageSize ?? 20));
  const offset = (page - 1) * pageSize;

  const query = new URLSearchParams({
    select: 'id,group_id,name,exam_type,exam_date,subject,total_score,notes,created_at,updated_at',
    order: 'exam_date.desc,created_at.desc',
    limit: String(pageSize),
    offset: String(offset)
  });

  if (params.q?.trim()) {
    query.set('name', `ilike.*${params.q.trim()}*`);
  }

  if (params.groupId?.trim()) {
    query.set('group_id', `eq.${params.groupId.trim()}`);
  }

  if (params.examType && params.examType !== 'all') {
    query.set('exam_type', `eq.${params.examType}`);
  }

  const { rows: examRows, total } = await readRowsWithCount<GrowthExamRow>(buildTablePath(GROWTH_EXAMS_TABLE, query.toString()));
  if (examRows.length === 0) return { items: [], total, page, pageSize };

  const exams = examRows.map(mapGrowthExam);
  const examIds = exams.map((exam) => exam.id);

  const [groups, examScoreRows] = await Promise.all([
    listGrowthGroups({ status: 'all' }),
    readRows<GrowthExamScoreRow>(
      buildTablePath(
        GROWTH_EXAM_SCORES_TABLE,
        new URLSearchParams({
          select: 'id,exam_id,student_id,score,class_rank,grade_rank,mastery_level,note,created_at,updated_at',
          exam_id: buildInFilter(examIds)
        }).toString()
      )
    )
  ]);

  const examScores = examScoreRows.map(mapGrowthExamScore);
  const examScoreIds = examScores.map((score) => score.id);

  const tagRows =
    examScoreIds.length > 0
      ? await readRows<GrowthExamScoreTagRow>(
          buildTablePath(
            GROWTH_EXAM_SCORE_TAGS_TABLE,
            new URLSearchParams({
              select: 'id,exam_score_id,category,tag_name,sort_order,created_at',
              exam_score_id: buildInFilter(examScoreIds)
            }).toString()
          )
        )
      : [];

  const groupMap = new Map(groups.map((group) => [group.id, group]));
  const scoreMap = new Map<string, GrowthExamScore[]>();
  const scoreToExamMap = new Map(examScores.map((score) => [score.id, score.examId]));
  const tagMap = new Map<string, GrowthExamScoreTag[]>();

  for (const score of examScores) {
    const current = scoreMap.get(score.examId) ?? [];
    current.push(score);
    scoreMap.set(score.examId, current);
  }

  for (const row of tagRows) {
    const tag = mapGrowthExamScoreTag(row);
    const examId = scoreToExamMap.get(tag.examScoreId);
    if (!examId) continue;
    const current = tagMap.get(examId) ?? [];
    current.push(tag);
    tagMap.set(examId, current);
  }

  const items = exams.map((exam) => {
    const scores = scoreMap.get(exam.id) ?? [];
    const tags = tagMap.get(exam.id) ?? [];
    const tagCounts = new Map<string, number>();

    for (const tag of tags) {
      tagCounts.set(tag.tagName, (tagCounts.get(tag.tagName) ?? 0) + 1);
    }

    const topTags = [...tagCounts.entries()]
      .sort((left, right) => {
        if (right[1] !== left[1]) return right[1] - left[1];
        return left[0].localeCompare(right[0], 'zh-CN');
      })
      .slice(0, 3)
      .map(([tagName, count]) => ({ tagName, count }));

    const scoreValues = scores.map((score) => score.score);

    return {
      ...exam,
      group: groupMap.get(exam.groupId) ?? null,
      scoreCount: scores.length,
      avgScore: scoreValues.length ? scoreValues.reduce((sum, value) => sum + value, 0) / scoreValues.length : null,
      avgScoreRate: scoreValues.length ? (scoreValues.reduce((sum, value) => sum + value, 0) / scoreValues.length / exam.totalScore) * 100 : null,
      maxScore: scoreValues.length ? Math.max(...scoreValues) : null,
      minScore: scoreValues.length ? Math.min(...scoreValues) : null,
      masteryFilledCount: scores.filter((score) => Boolean(score.masteryLevel)).length,
      topTags
    };
  });

  return { items, total, page, pageSize };
}

export async function getGrowthExamDetailById(examId: string): Promise<GrowthExamDetail | null> {
  const normalizedExamId = examId.trim();
  if (!normalizedExamId) return null;

  const examRows = await readRows<GrowthExamRow>(
    buildTablePath(
      GROWTH_EXAMS_TABLE,
      new URLSearchParams({
        select: 'id,group_id,name,exam_type,exam_date,subject,total_score,notes,created_at,updated_at',
        id: `eq.${normalizedExamId}`,
        limit: '1'
      }).toString()
    )
  );

  const examRow = examRows[0];
  if (!examRow) return null;

  const exam = mapGrowthExam(examRow);
  const [groups, scoreRows] = await Promise.all([
    listGrowthGroups({ status: 'all' }),
    readRows<GrowthExamScoreRow>(
      buildTablePath(
        GROWTH_EXAM_SCORES_TABLE,
        new URLSearchParams({
          select: 'id,exam_id,student_id,score,class_rank,grade_rank,mastery_level,note,created_at,updated_at',
          exam_id: `eq.${normalizedExamId}`,
          order: 'created_at.asc'
        }).toString()
      )
    )
  ]);

  const scores = scoreRows.map(mapGrowthExamScore);
  const scoreIds = scores.map((score) => score.id);
  const [studentMap, tagRows] = await Promise.all([
    readGrowthStudentsByIds([...new Set(scores.map((score) => score.studentId))]),
    scoreIds.length > 0
      ? readRows<GrowthExamScoreTagRow>(
          buildTablePath(
            GROWTH_EXAM_SCORE_TAGS_TABLE,
            new URLSearchParams({
              select: 'id,exam_score_id,category,tag_name,sort_order,created_at',
              exam_score_id: buildInFilter(scoreIds),
              order: 'sort_order.asc,created_at.asc'
            }).toString()
          )
        )
      : Promise.resolve([] as GrowthExamScoreTagRow[])
  ]);

  const groupMap = new Map(groups.map((group) => [group.id, group]));
  const tagMap = new Map<string, GrowthExamScoreTag[]>();

  for (const row of tagRows) {
    const tag = mapGrowthExamScoreTag(row);
    const current = tagMap.get(tag.examScoreId) ?? [];
    current.push(tag);
    tagMap.set(tag.examScoreId, current);
  }

  return {
    ...exam,
    group: groupMap.get(exam.groupId) ?? null,
    scores: scores.map((score) => ({
      ...score,
      student: studentMap.get(score.studentId) ?? null,
      tags: tagMap.get(score.id) ?? []
    }))
  };
}

async function buildGrowthStudentReport(student: GrowthStudent): Promise<GrowthParentReport> {
  const [groups, lessonRecordRows, examScoreRows] = await Promise.all([
    listGrowthGroups({ status: 'all' }),
    readRows<GrowthLessonRecordRow>(
      buildTablePath(
        GROWTH_LESSON_RECORDS_TABLE,
        new URLSearchParams({
          select: 'id,lesson_id,student_id,is_guest,entry_score,exit_score,performance,mastery_level,comment,created_at,updated_at',
          student_id: `eq.${student.id}`,
          order: 'created_at.desc'
        }).toString()
      )
    ),
    readRows<GrowthExamScoreRow>(
      buildTablePath(
        GROWTH_EXAM_SCORES_TABLE,
        new URLSearchParams({
          select: 'id,exam_id,student_id,score,class_rank,grade_rank,mastery_level,note,created_at,updated_at',
          student_id: `eq.${student.id}`,
          order: 'created_at.desc'
        }).toString()
      )
    )
  ]);

  const groupMap = new Map(groups.map((group) => [group.id, group]));
  const lessonRecords = lessonRecordRows.map(mapGrowthLessonRecord);
  const examScores = examScoreRows.map(mapGrowthExamScore);
  const lessonIds = [...new Set(lessonRecords.map((record) => record.lessonId))];
  const examIds = [...new Set(examScores.map((score) => score.examId))];
  const examScoreIds = examScores.map((score) => score.id);

  const [lessonRows, examRows, tagRows] = await Promise.all([
    lessonIds.length > 0
      ? readRows<GrowthLessonRow>(
          buildTablePath(
            GROWTH_LESSONS_TABLE,
            new URLSearchParams({
              select: 'id,group_id,lesson_date,time_start,time_end,topic,entry_test_topic,exit_test_topic,test_total,homework,key_points,notes,created_at,updated_at',
              id: buildInFilter(lessonIds)
            }).toString()
          )
        )
      : Promise.resolve([] as GrowthLessonRow[]),
    examIds.length > 0
      ? readRows<GrowthExamRow>(
          buildTablePath(
            GROWTH_EXAMS_TABLE,
            new URLSearchParams({
              select: 'id,group_id,name,exam_type,exam_date,subject,total_score,notes,created_at,updated_at',
              id: buildInFilter(examIds)
            }).toString()
          )
        )
      : Promise.resolve([] as GrowthExamRow[]),
    examScoreIds.length > 0
      ? readRows<GrowthExamScoreTagRow>(
          buildTablePath(
            GROWTH_EXAM_SCORE_TAGS_TABLE,
            new URLSearchParams({
              select: 'id,exam_score_id,category,tag_name,sort_order,created_at',
              exam_score_id: buildInFilter(examScoreIds)
            }).toString()
          )
        )
      : Promise.resolve([] as GrowthExamScoreTagRow[])
  ]);

  const lessonMap = new Map(lessonRows.map(mapGrowthLesson).map((lesson) => [lesson.id, lesson]));
  const examMap = new Map(examRows.map(mapGrowthExam).map((exam) => [exam.id, exam]));
  const tagMap = new Map<string, GrowthExamScoreTag[]>();

  for (const row of tagRows) {
    const tag = mapGrowthExamScoreTag(row);
    const current = tagMap.get(tag.examScoreId) ?? [];
    current.push(tag);
    tagMap.set(tag.examScoreId, current);
  }

  const recentLessons = lessonRecords
    .flatMap((record) => {
      const lesson = lessonMap.get(record.lessonId);
      if (!lesson) return [];

      return [
        {
          ...record,
          lesson,
          group: groupMap.get(lesson.groupId) ?? null,
          exitScoreRate: record.exitScore !== null && lesson.testTotal !== null && lesson.testTotal > 0 ? (record.exitScore / lesson.testTotal) * 100 : null
        }
      ];
    })
    .sort((left, right) => {
      const byLessonDate = compareDateDesc(left.lesson.lessonDate, right.lesson.lessonDate);
      if (byLessonDate !== 0) return byLessonDate;
      return compareDateDesc(left.createdAt, right.createdAt);
    });

  const recentExams = examScores
    .flatMap((score) => {
      const exam = examMap.get(score.examId);
      if (!exam) return [];

      return [
        {
          ...score,
          exam,
          group: groupMap.get(exam.groupId) ?? null,
          scoreRate: exam.totalScore > 0 ? (score.score / exam.totalScore) * 100 : null,
          tags: tagMap.get(score.id) ?? []
        }
      ];
    })
    .sort((left, right) => {
      const byExamDate = compareDateDesc(left.exam.examDate, right.exam.examDate);
      if (byExamDate !== 0) return byExamDate;
      return compareDateDesc(left.createdAt, right.createdAt);
    });

  const exitRateValues = recentLessons.flatMap((item) => (item.exitScoreRate === null ? [] : [item.exitScoreRate]));
  const performanceValues = recentLessons.flatMap((item) => (item.performance === null ? [] : [item.performance]));
  const examRateValues = recentExams.flatMap((item) => (item.scoreRate === null ? [] : [item.scoreRate]));
  const tagCounts = new Map<string, number>();

  for (const item of recentExams) {
    for (const tag of item.tags) {
      tagCounts.set(tag.tagName, (tagCounts.get(tag.tagName) ?? 0) + 1);
    }
  }

  return {
    student,
    homeGroup: student.homeGroupId ? groupMap.get(student.homeGroupId) ?? null : null,
    lessonCount: recentLessons.length,
    examCount: recentExams.length,
    avgExitScoreRate: exitRateValues.length ? exitRateValues.reduce((sum, value) => sum + value, 0) / exitRateValues.length : null,
    avgPerformance: performanceValues.length ? performanceValues.reduce((sum, value) => sum + value, 0) / performanceValues.length : null,
    avgExamScoreRate: examRateValues.length ? examRateValues.reduce((sum, value) => sum + value, 0) / examRateValues.length : null,
    topWeakTags: [...tagCounts.entries()]
      .sort((left, right) => {
        if (right[1] !== left[1]) return right[1] - left[1];
        return left[0].localeCompare(right[0], 'zh-CN');
      })
      .slice(0, 8)
      .map(([tagName, count]) => ({ tagName, count })),
    recentLessons,
    recentExams
  };
}

export async function getGrowthStudentReportById(studentId: string): Promise<GrowthParentReport | null> {
  const normalizedStudentId = studentId.trim();
  if (!normalizedStudentId) return null;

  const studentRows = await readRows<GrowthStudentRow>(
    buildTablePath(
      GROWTH_STUDENTS_TABLE,
      new URLSearchParams({
        select: 'id,name,grade_label,home_group_id,parent_access_token,status,notes,created_at,updated_at',
        id: `eq.${normalizedStudentId}`,
        limit: '1'
      }).toString()
    )
  );

  if (studentRows.length === 0) return null;
  return buildGrowthStudentReport(mapGrowthStudent(studentRows[0]));
}

export async function getGrowthParentReportByToken(token: string): Promise<GrowthParentReport | null> {
  const normalizedToken = token.trim();
  if (!normalizedToken) return null;

  const studentRows = await readRows<GrowthStudentRow>(
    buildTablePath(
      GROWTH_STUDENTS_TABLE,
      new URLSearchParams({
        select: 'id,name,grade_label,home_group_id,parent_access_token,status,notes,created_at,updated_at',
        parent_access_token: `eq.${normalizedToken}`,
        limit: '1'
      }).toString()
    )
  );

  if (studentRows.length === 0) return null;
  return buildGrowthStudentReport(mapGrowthStudent(studentRows[0]));
}
