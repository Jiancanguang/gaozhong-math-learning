import 'server-only';

import { buildTablePath, supabaseAdminRequest } from '@/lib/supabase-admin';
import { type Student, type Grade, type StudentStatus, listStudents } from '@/lib/score-tracker';

export const MASTERY_LEVELS = ['mastered', 'partial', 'weak'] as const;
export type MasteryLevel = (typeof MASTERY_LEVELS)[number];

export const GRADE_LABELS: Record<string, string> = {
  '10': '高一',
  '11': '高二',
  '12': '高三'
};

export type Lesson = {
  id: string;
  date: string;
  groupName: string;
  topic: string;
  entryTestTopic: string;
  exitTestTopic: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type LessonRecord = {
  id: string;
  studentId: string;
  lessonId: string;
  entryScore: number | null;
  exitScore: number | null;
  performance: number | null;
  mastery: MasteryLevel | null;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

export type LessonWithRecords = Lesson & {
  records: (LessonRecord & { studentName?: string })[];
};

export type StudentLessonRecord = LessonRecord & {
  lesson: Lesson;
};

export type StudentGrowthSummary = {
  student: Student;
  lessonRecords: StudentLessonRecord[];
  lessonCount: number;
  avgEntryScore: number | null;
  avgExitScore: number | null;
  avgPerformance: number | null;
  masteryDistribution: { mastered: number; partial: number; weak: number };
};

export type CreateLessonInput = {
  date: string;
  groupName: string;
  topic: string;
  entryTestTopic?: string;
  exitTestTopic?: string;
  notes?: string;
};

export type CreateLessonRecordInput = {
  studentId: string;
  entryScore?: number | null;
  exitScore?: number | null;
  performance?: number | null;
  mastery?: MasteryLevel | null;
  comment?: string;
};

export type DashboardStats = {
  totalStudents: number;
  totalLessons: number;
  avgEntryScore: number | null;
  avgExitScore: number | null;
};

// --- Row types (database shape) ---

type LessonRow = {
  id: string;
  date: string;
  group_name: string;
  topic: string;
  entry_test_topic: string;
  exit_test_topic: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

type LessonRecordRow = {
  id: string;
  student_id: string;
  lesson_id: string;
  entry_score: number | null;
  exit_score: number | null;
  performance: number | null;
  mastery: string | null;
  comment: string;
  created_at: string;
  updated_at: string;
};

const LESSONS_TABLE = 'lessons';
const LESSON_RECORDS_TABLE = 'lesson_records';

// --- Mappers ---

function mapLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    date: row.date,
    groupName: row.group_name,
    topic: row.topic,
    entryTestTopic: row.entry_test_topic ?? '',
    exitTestTopic: row.exit_test_topic ?? '',
    notes: row.notes ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapLessonRecord(row: LessonRecordRow): LessonRecord {
  return {
    id: row.id,
    studentId: row.student_id,
    lessonId: row.lesson_id,
    entryScore: row.entry_score,
    exitScore: row.exit_score,
    performance: row.performance,
    mastery: isMasteryLevel(row.mastery) ? row.mastery : null,
    comment: row.comment ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function isMasteryLevel(value: string | null | undefined): value is MasteryLevel {
  return (MASTERY_LEVELS as readonly string[]).includes(value ?? '');
}

async function readRows<T>(path: string) {
  const response = await supabaseAdminRequest(path);
  if (!response) return [] as T[];
  return (await response.json()) as T[];
}

// --- Lesson CRUD ---

export async function listLessons(params?: { groupName?: string }): Promise<Lesson[]> {
  const query = new URLSearchParams({
    select: 'id,date,group_name,topic,entry_test_topic,exit_test_topic,notes,created_at,updated_at',
    order: 'date.desc,created_at.desc'
  });

  if (params?.groupName?.trim()) {
    query.set('group_name', `eq.${params.groupName.trim()}`);
  }

  const rows = await readRows<LessonRow>(buildTablePath(LESSONS_TABLE, query.toString()));
  return rows.map(mapLesson);
}

export async function getLessonById(lessonId: string): Promise<LessonWithRecords | null> {
  if (!lessonId) return null;

  const lessonQuery = new URLSearchParams({
    select: 'id,date,group_name,topic,entry_test_topic,exit_test_topic,notes,created_at,updated_at',
    id: `eq.${lessonId}`,
    limit: '1'
  });
  const lessonRows = await readRows<LessonRow>(buildTablePath(LESSONS_TABLE, lessonQuery.toString()));
  const lessonRow = lessonRows[0];
  if (!lessonRow) return null;

  const recordQuery = new URLSearchParams({
    select: 'id,student_id,lesson_id,entry_score,exit_score,performance,mastery,comment,created_at,updated_at',
    lesson_id: `eq.${lessonId}`,
    order: 'created_at.asc'
  });
  const recordRows = await readRows<LessonRecordRow>(buildTablePath(LESSON_RECORDS_TABLE, recordQuery.toString()));

  return {
    ...mapLesson(lessonRow),
    records: recordRows.map(mapLessonRecord)
  };
}

export async function createLesson(input: CreateLessonInput): Promise<Lesson> {
  const response = await supabaseAdminRequest(buildTablePath(LESSONS_TABLE), {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      date: input.date,
      group_name: input.groupName.trim(),
      topic: input.topic.trim(),
      entry_test_topic: input.entryTestTopic?.trim() ?? '',
      exit_test_topic: input.exitTestTopic?.trim() ?? '',
      notes: input.notes?.trim() ?? ''
    })
  });

  if (!response) throw new Error('Supabase is not configured.');
  const rows = (await response.json()) as LessonRow[];
  return mapLesson(rows[0]);
}

export async function deleteLesson(lessonId: string): Promise<void> {
  if (!lessonId) return;

  const query = new URLSearchParams({ id: `eq.${lessonId}` });
  const response = await supabaseAdminRequest(buildTablePath(LESSONS_TABLE, query.toString()), {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' }
  });
  if (!response) throw new Error('Supabase is not configured.');
}

// --- Lesson Records ---

export async function saveLessonRecords(lessonId: string, records: CreateLessonRecordInput[]): Promise<void> {
  // Delete existing records for this lesson
  const deleteQuery = new URLSearchParams({ lesson_id: `eq.${lessonId}` });
  const deleteResponse = await supabaseAdminRequest(buildTablePath(LESSON_RECORDS_TABLE, deleteQuery.toString()), {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' }
  });
  if (!deleteResponse) throw new Error('Supabase is not configured.');

  // Filter out records with no data (student was absent)
  const validRecords = records.filter(
    (r) => r.entryScore != null || r.exitScore != null || r.performance != null || r.mastery != null || r.comment?.trim()
  );
  if (validRecords.length === 0) return;

  const response = await supabaseAdminRequest(buildTablePath(LESSON_RECORDS_TABLE), {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(
      validRecords.map((r) => ({
        student_id: r.studentId,
        lesson_id: lessonId,
        entry_score: r.entryScore ?? null,
        exit_score: r.exitScore ?? null,
        performance: r.performance ?? null,
        mastery: r.mastery ?? null,
        comment: r.comment?.trim() ?? ''
      }))
    )
  });
  if (!response) throw new Error('Supabase is not configured.');
}

// --- Student-centric queries ---

export async function listStudentLessonRecords(studentId: string): Promise<StudentLessonRecord[]> {
  if (!studentId) return [];

  const recordQuery = new URLSearchParams({
    select: 'id,student_id,lesson_id,entry_score,exit_score,performance,mastery,comment,created_at,updated_at',
    student_id: `eq.${studentId}`,
    order: 'created_at.asc'
  });
  const recordRows = await readRows<LessonRecordRow>(buildTablePath(LESSON_RECORDS_TABLE, recordQuery.toString()));
  if (recordRows.length === 0) return [];

  // Fetch associated lessons
  const lessonIds = [...new Set(recordRows.map((r) => r.lesson_id))];
  const lessonQuery = new URLSearchParams({
    select: 'id,date,group_name,topic,entry_test_topic,exit_test_topic,notes,created_at,updated_at',
    id: `in.(${lessonIds.join(',')})`,
    order: 'date.asc,created_at.asc'
  });
  const lessonRows = await readRows<LessonRow>(buildTablePath(LESSONS_TABLE, lessonQuery.toString()));
  const lessonsById = new Map(lessonRows.map((row) => [row.id, mapLesson(row)]));

  return recordRows
    .map((row) => {
      const lesson = lessonsById.get(row.lesson_id);
      if (!lesson) return null;
      return { ...mapLessonRecord(row), lesson };
    })
    .filter((r): r is StudentLessonRecord => r !== null)
    .sort((a, b) => a.lesson.date.localeCompare(b.lesson.date) || a.lesson.createdAt.localeCompare(b.lesson.createdAt));
}

export async function getStudentByParentToken(token: string): Promise<Student | null> {
  if (!token?.trim()) return null;

  const query = new URLSearchParams({
    select: 'id,name,grade,class_name,head_teacher,is_active,notes,group_name,parent_token,status,created_at,updated_at',
    parent_token: `eq.${token.trim()}`,
    status: 'eq.active',
    limit: '1'
  });

  const response = await supabaseAdminRequest(buildTablePath('students', query.toString()));
  if (!response) return null;

  const rows = (await response.json()) as Array<{
    id: string; name: string; grade: Grade; class_name: string;
    head_teacher?: string | null; is_active?: boolean | null; notes: string;
    group_name?: string | null; parent_token?: string | null; status?: string | null;
    created_at: string; updated_at: string;
  }>;

  if (rows.length === 0) return null;

  const row = rows[0];
  const status = (row.status === 'active' || row.status === 'archived' ? row.status : 'active') as StudentStatus;
  return {
    id: row.id,
    name: row.name,
    grade: row.grade,
    className: row.class_name,
    headTeacher: row.head_teacher?.trim() ?? '',
    isActive: status === 'active',
    notes: row.notes ?? '',
    groupName: row.group_name?.trim() ?? '',
    parentToken: row.parent_token ?? '',
    status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getStudentGrowthSummary(studentId: string): Promise<StudentGrowthSummary | null> {
  const students = await listStudents({ q: '' });
  const student = students.find((s) => s.id === studentId);
  if (!student) return null;

  const lessonRecords = await listStudentLessonRecords(studentId);

  const entryScores = lessonRecords.filter((r) => r.entryScore != null).map((r) => r.entryScore!);
  const exitScores = lessonRecords.filter((r) => r.exitScore != null).map((r) => r.exitScore!);
  const performances = lessonRecords.filter((r) => r.performance != null).map((r) => r.performance!);

  const masteryDistribution = { mastered: 0, partial: 0, weak: 0 };
  for (const r of lessonRecords) {
    if (r.mastery) masteryDistribution[r.mastery]++;
  }

  return {
    student,
    lessonRecords,
    lessonCount: lessonRecords.length,
    avgEntryScore: entryScores.length > 0 ? entryScores.reduce((a, b) => a + b, 0) / entryScores.length : null,
    avgExitScore: exitScores.length > 0 ? exitScores.reduce((a, b) => a + b, 0) / exitScores.length : null,
    avgPerformance: performances.length > 0 ? performances.reduce((a, b) => a + b, 0) / performances.length : null,
    masteryDistribution
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const students = await listStudents({ status: 'active' });
  const lessons = await listLessons();

  // Fetch all records for average computation
  const recordQuery = new URLSearchParams({
    select: 'entry_score,exit_score',
    order: 'created_at.desc',
    limit: '500'
  });
  const recordRows = await readRows<Pick<LessonRecordRow, 'entry_score' | 'exit_score'>>(
    buildTablePath(LESSON_RECORDS_TABLE, recordQuery.toString())
  );

  const entryScores = recordRows.filter((r) => r.entry_score != null).map((r) => r.entry_score!);
  const exitScores = recordRows.filter((r) => r.exit_score != null).map((r) => r.exit_score!);

  return {
    totalStudents: students.length,
    totalLessons: lessons.length,
    avgEntryScore: entryScores.length > 0 ? Math.round((entryScores.reduce((a, b) => a + b, 0) / entryScores.length) * 10) / 10 : null,
    avgExitScore: exitScores.length > 0 ? Math.round((exitScores.reduce((a, b) => a + b, 0) / exitScores.length) * 10) / 10 : null
  };
}

export async function getDistinctGroupNames(): Promise<string[]> {
  const query = new URLSearchParams({
    select: 'group_name',
    group_name: 'neq.',
    status: 'eq.active',
    order: 'group_name.asc'
  });
  const response = await supabaseAdminRequest(buildTablePath('students', query.toString()));
  if (!response) return [];
  const rows = (await response.json()) as Array<{ group_name: string }>;
  const unique = [...new Set(rows.map((r) => r.group_name).filter(Boolean))];
  return unique;
}

export function isGrowthTrackerTableMissingError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const markers = ['PGRST205', 'PGRST204', '42703', LESSONS_TABLE, LESSON_RECORDS_TABLE, 'does not exist', 'schema cache'];
  return markers.some((m) => message.includes(m));
}
