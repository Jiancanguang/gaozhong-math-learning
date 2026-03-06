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

export type ListGrowthLessonsParams = {
  q?: string;
  groupId?: string;
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

export type ListGrowthExamsParams = {
  q?: string;
  groupId?: string;
  examType?: 'all' | 'school' | 'internal' | 'other';
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

async function readRows<T>(path: string) {
  const response = await supabaseAdminRequest(path);
  if (!response) return [] as T[];
  return (await response.json()) as T[];
}

async function readCount(tableName: string) {
  const rows = await readRows<{ id: string }>(buildTablePath(tableName, new URLSearchParams({ select: 'id' }).toString()));
  return rows.length;
}

function buildInFilter(ids: string[]) {
  return `in.(${ids.join(',')})`;
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

export async function listGrowthLessons(params: ListGrowthLessonsParams = {}): Promise<GrowthLessonListItem[]> {
  const query = new URLSearchParams({
    select: 'id,group_id,lesson_date,time_start,time_end,topic,entry_test_topic,exit_test_topic,test_total,homework,key_points,notes,created_at,updated_at',
    order: 'lesson_date.desc,created_at.desc'
  });

  if (params.q?.trim()) {
    query.set('topic', `ilike.*${params.q.trim()}*`);
  }

  if (params.groupId?.trim()) {
    query.set('group_id', `eq.${params.groupId.trim()}`);
  }

  const lessonRows = await readRows<GrowthLessonRow>(buildTablePath(GROWTH_LESSONS_TABLE, query.toString()));
  if (lessonRows.length === 0) return [];

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

  return lessons.map((lesson) => {
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
}

export async function listGrowthExams(params: ListGrowthExamsParams = {}): Promise<GrowthExamListItem[]> {
  const query = new URLSearchParams({
    select: 'id,group_id,name,exam_type,exam_date,subject,total_score,notes,created_at,updated_at',
    order: 'exam_date.desc,created_at.desc'
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

  const examRows = await readRows<GrowthExamRow>(buildTablePath(GROWTH_EXAMS_TABLE, query.toString()));
  if (examRows.length === 0) return [];

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

  return exams.map((exam) => {
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
}
