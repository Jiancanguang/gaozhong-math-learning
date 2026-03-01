import 'server-only';

import { buildTablePath, isSupabaseAdminEnabled, supabaseAdminRequest } from '@/lib/supabase-admin';

export const GRADES = ['10', '11', '12'] as const;
export type Grade = (typeof GRADES)[number];

export const SUBJECTS = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology', 'politics', 'history', 'geography'] as const;
export type Subject = (typeof SUBJECTS)[number];

export const EXAM_TYPES = ['monthly', 'midterm', 'final', 'mock', 'weekly', 'joint', 'other'] as const;
export type ExamType = (typeof EXAM_TYPES)[number];

export const SUBJECT_LABELS: Record<Subject, string> = {
  chinese: '语文',
  math: '数学',
  english: '英语',
  physics: '物理',
  chemistry: '化学',
  biology: '生物',
  politics: '政治',
  history: '历史',
  geography: '地理'
};

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  monthly: '月考',
  midterm: '期中',
  final: '期末',
  mock: '模考',
  weekly: '周测',
  joint: '联考',
  other: '其他'
};

export type Student = {
  id: string;
  name: string;
  grade: Grade;
  className: string;
  headTeacher: string;
  isActive: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type SubjectScore = {
  id: string;
  examRecordId: string;
  subject: Subject;
  score: number;
  fullScore: number | null;
  createdAt: string;
};

export type StudentExamRecord = {
  id: string;
  studentId: string;
  examName: string;
  examType: ExamType;
  examDate: string;
  totalScore: number;
  totalFullScore: number | null;
  classRank: number | null;
  gradeRank: number | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  subjectScores: SubjectScore[];
};

export type SubjectDelta = {
  subject: Subject;
  label: string;
  delta: number;
};

export type LatestChangeConclusion = {
  totalScoreDelta: number | null;
  classRankDelta: number | null;
  gradeRankDelta: number | null;
  bestImprovedSubject: SubjectDelta | null;
  worstDroppedSubject: SubjectDelta | null;
};

export type StudentTrendPoint = {
  examId: string;
  examName: string;
  examDate: string;
  totalScore: number;
  totalFullScore: number | null;
  scoreRate: number | null;
  classRank: number | null;
  gradeRank: number | null;
};

export type StudentTrendSummary = {
  student: Student;
  records: StudentExamRecord[];
  trendPoints: StudentTrendPoint[];
  latestExam: StudentExamRecord | null;
  latestChange: LatestChangeConclusion;
  examCount: number;
};

export type StudentTrendLabel = 'up' | 'down' | 'flat' | 'watch';

export type StudentListItem = Student & {
  examCount: number;
  latestExam: {
    examName: string;
    examDate: string;
    totalScore: number;
    classRank: number | null;
    gradeRank: number | null;
  } | null;
  latestTrend: StudentTrendLabel;
};

export type ListStudentsParams = {
  q?: string;
  grade?: Grade | '';
  className?: string;
  headTeacher?: string;
  isActive?: 'all' | 'active' | 'inactive';
};

export type CreateStudentInput = {
  name: string;
  grade: Grade;
  className: string;
  headTeacher?: string;
  isActive?: boolean;
  notes?: string;
};

export type UpdateStudentInput = CreateStudentInput;

export type SubjectScoreInput = {
  subject: Subject;
  score: number;
  fullScore?: number | null;
};

export type CreateExamRecordInput = {
  studentId: string;
  examName: string;
  examType: ExamType;
  examDate: string;
  totalScore: number;
  totalFullScore?: number | null;
  classRank?: number | null;
  gradeRank?: number | null;
  notes?: string;
  subjectScores: SubjectScoreInput[];
};

export type UpdateExamRecordInput = Omit<CreateExamRecordInput, 'studentId'>;

const STUDENTS_TABLE = 'students';
const EXAM_RECORDS_TABLE = 'student_exam_records';
const SUBJECT_SCORES_TABLE = 'student_exam_subject_scores';

type StudentRow = {
  id: string;
  name: string;
  grade: Grade;
  class_name: string;
  head_teacher?: string | null;
  is_active?: boolean | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

type ExamRecordRow = {
  id: string;
  student_id: string;
  exam_name: string;
  exam_type: ExamType;
  exam_date: string;
  total_score: number | string;
  total_full_score: number | string | null;
  class_rank: number | string | null;
  grade_rank: number | string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

type SubjectScoreRow = {
  id: string;
  exam_record_id: string;
  subject: Subject;
  score: number | string;
  full_score: number | string | null;
  created_at: string;
};

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toInteger(value: number | string | null | undefined) {
  const parsed = toNumber(value);
  return parsed === null ? null : Math.trunc(parsed);
}

function mapStudent(row: StudentRow): Student {
  return {
    id: row.id,
    name: row.name,
    grade: row.grade,
    className: row.class_name,
    headTeacher: row.head_teacher?.trim() ?? '',
    isActive: row.is_active ?? true,
    notes: row.notes ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapSubjectScore(row: SubjectScoreRow): SubjectScore {
  return {
    id: row.id,
    examRecordId: row.exam_record_id,
    subject: row.subject,
    score: toNumber(row.score) ?? 0,
    fullScore: toNumber(row.full_score),
    createdAt: row.created_at
  };
}

function mapExamRecord(row: ExamRecordRow, subjectScores: SubjectScore[]): StudentExamRecord {
  return {
    id: row.id,
    studentId: row.student_id,
    examName: row.exam_name,
    examType: row.exam_type,
    examDate: row.exam_date,
    totalScore: toNumber(row.total_score) ?? 0,
    totalFullScore: toNumber(row.total_full_score),
    classRank: toInteger(row.class_rank),
    gradeRank: toInteger(row.grade_rank),
    notes: row.notes ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    subjectScores
  };
}

function compareRecordsDesc(a: Pick<StudentExamRecord, 'examDate' | 'createdAt'>, b: Pick<StudentExamRecord, 'examDate' | 'createdAt'>) {
  const dateCompare = b.examDate.localeCompare(a.examDate);
  if (dateCompare !== 0) return dateCompare;
  return b.createdAt.localeCompare(a.createdAt);
}

function compareRowsDesc(a: ExamRecordRow, b: ExamRecordRow) {
  const dateCompare = b.exam_date.localeCompare(a.exam_date);
  if (dateCompare !== 0) return dateCompare;
  return b.created_at.localeCompare(a.created_at);
}

function sortRecordsDesc(records: StudentExamRecord[]) {
  return [...records].sort(compareRecordsDesc);
}

function sortRecordsAsc(records: StudentExamRecord[]) {
  return [...records].sort((a, b) => compareRecordsDesc(b, a));
}

async function readRows<T>(path: string) {
  const response = await supabaseAdminRequest(path);
  if (!response) return [] as T[];
  return (await response.json()) as T[];
}

async function fetchSubjectScoresByExamIds(examIds: string[]) {
  if (examIds.length === 0) return new Map<string, SubjectScore[]>();

  const params = new URLSearchParams({
    select: 'id,exam_record_id,subject,score,full_score,created_at',
    exam_record_id: `in.(${examIds.join(',')})`,
    order: 'created_at.asc'
  });
  const rows = await readRows<SubjectScoreRow>(buildTablePath(SUBJECT_SCORES_TABLE, params.toString()));
  const grouped = new Map<string, SubjectScore[]>();

  for (const row of rows) {
    const current = grouped.get(row.exam_record_id) ?? [];
    current.push(mapSubjectScore(row));
    current.sort((left, right) => left.subject.localeCompare(right.subject));
    grouped.set(row.exam_record_id, current);
  }

  return grouped;
}

export function isScoreTrackerStoreEnabled() {
  return isSupabaseAdminEnabled();
}

export function isGrade(value: string): value is Grade {
  return (GRADES as readonly string[]).includes(value);
}

export function isSubject(value: string): value is Subject {
  return (SUBJECTS as readonly string[]).includes(value);
}

export function isExamType(value: string): value is ExamType {
  return (EXAM_TYPES as readonly string[]).includes(value);
}

export function isScoreTrackerTableMissingError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const schemaMarkers = [
    'PGRST205',
    'PGRST204',
    '42703',
    STUDENTS_TABLE,
    EXAM_RECORDS_TABLE,
    SUBJECT_SCORES_TABLE,
    'head_teacher',
    'is_active',
    'schema cache',
    'does not exist'
  ];

  return schemaMarkers.some((marker) => message.includes(marker));
}

export async function listStudents(params: ListStudentsParams = {}): Promise<StudentListItem[]> {
  const query = new URLSearchParams({
    select: 'id,name,grade,class_name,head_teacher,is_active,notes,created_at,updated_at',
    order: 'grade.asc,class_name.asc,name.asc'
  });

  if (params.q?.trim()) {
    query.set('name', `ilike.*${params.q.trim()}*`);
  }

  if (params.grade) {
    query.set('grade', `eq.${params.grade}`);
  }

  if (params.className?.trim()) {
    query.set('class_name', `eq.${params.className.trim()}`);
  }

  if (params.headTeacher?.trim()) {
    query.set('head_teacher', `eq.${params.headTeacher.trim()}`);
  }

  if (params.isActive === 'active') {
    query.set('is_active', 'eq.true');
  }

  if (params.isActive === 'inactive') {
    query.set('is_active', 'eq.false');
  }

  const studentRows = await readRows<StudentRow>(buildTablePath(STUDENTS_TABLE, query.toString()));
  if (studentRows.length === 0) return [];

  const students = studentRows.map(mapStudent);
  const studentIds = students.map((student) => student.id);

  const examQuery = new URLSearchParams({
    select: 'id,student_id,exam_name,exam_type,exam_date,total_score,total_full_score,class_rank,grade_rank,notes,created_at,updated_at',
    student_id: `in.(${studentIds.join(',')})`,
    order: 'student_id.asc,exam_date.desc,created_at.desc'
  });
  const examRows = await readRows<ExamRecordRow>(buildTablePath(EXAM_RECORDS_TABLE, examQuery.toString()));
  const examsByStudent = new Map<string, ExamRecordRow[]>();

  for (const row of examRows) {
    const current = examsByStudent.get(row.student_id) ?? [];
    current.push(row);
    current.sort(compareRowsDesc);
    examsByStudent.set(row.student_id, current);
  }

  return students.map((student) => {
    const records = examsByStudent.get(student.id) ?? [];
    const latest = records[0] ?? null;
    const previous = records[1] ?? null;
    let latestTrend: StudentTrendLabel = 'watch';

    if (latest && previous) {
      const latestScore = toNumber(latest.total_score) ?? 0;
      const previousScore = toNumber(previous.total_score) ?? 0;
      if (latestScore > previousScore) latestTrend = 'up';
      else if (latestScore < previousScore) latestTrend = 'down';
      else latestTrend = 'flat';
    }

    return {
      ...student,
      examCount: records.length,
      latestExam: latest
        ? {
            examName: latest.exam_name,
            examDate: latest.exam_date,
            totalScore: toNumber(latest.total_score) ?? 0,
            classRank: toInteger(latest.class_rank),
            gradeRank: toInteger(latest.grade_rank)
          }
        : null,
      latestTrend
    };
  });
}

export async function getStudentById(studentId: string): Promise<Student | null> {
  if (!studentId) return null;

  const params = new URLSearchParams({
    select: 'id,name,grade,class_name,head_teacher,is_active,notes,created_at,updated_at',
    id: `eq.${studentId}`,
    limit: '1'
  });
  const rows = await readRows<StudentRow>(buildTablePath(STUDENTS_TABLE, params.toString()));
  const row = rows[0];

  return row ? mapStudent(row) : null;
}

export async function createStudent(input: CreateStudentInput): Promise<Student> {
  const response = await supabaseAdminRequest(buildTablePath(STUDENTS_TABLE), {
    method: 'POST',
    headers: {
      Prefer: 'return=representation'
    },
    body: JSON.stringify({
      name: input.name.trim(),
      grade: input.grade,
      class_name: input.className.trim(),
      head_teacher: input.headTeacher?.trim() ?? '',
      is_active: input.isActive ?? true,
      notes: input.notes?.trim() ?? ''
    })
  });

  if (!response) {
    throw new Error('Supabase is not configured.');
  }

  const rows = (await response.json()) as StudentRow[];
  return mapStudent(rows[0]);
}

export async function updateStudent(studentId: string, input: UpdateStudentInput): Promise<Student> {
  const query = new URLSearchParams({
    id: `eq.${studentId}`
  });

  const response = await supabaseAdminRequest(buildTablePath(STUDENTS_TABLE, query.toString()), {
    method: 'PATCH',
    headers: {
      Prefer: 'return=representation'
    },
    body: JSON.stringify({
      name: input.name.trim(),
      grade: input.grade,
      class_name: input.className.trim(),
      head_teacher: input.headTeacher?.trim() ?? '',
      is_active: input.isActive ?? true,
      notes: input.notes?.trim() ?? ''
    })
  });

  if (!response) {
    throw new Error('Supabase is not configured.');
  }

  const rows = (await response.json()) as StudentRow[];
  return mapStudent(rows[0]);
}

export async function listStudentExamRecords(studentId: string): Promise<StudentExamRecord[]> {
  if (!studentId) return [];

  const params = new URLSearchParams({
    select: 'id,student_id,exam_name,exam_type,exam_date,total_score,total_full_score,class_rank,grade_rank,notes,created_at,updated_at',
    student_id: `eq.${studentId}`,
    order: 'exam_date.desc,created_at.desc'
  });
  const examRows = await readRows<ExamRecordRow>(buildTablePath(EXAM_RECORDS_TABLE, params.toString()));
  if (examRows.length === 0) return [];

  const subjectScoresByExam = await fetchSubjectScoresByExamIds(examRows.map((row) => row.id));
  return examRows.map((row) => mapExamRecord(row, subjectScoresByExam.get(row.id) ?? []));
}

export async function getExamRecordById(examId: string): Promise<StudentExamRecord | null> {
  if (!examId) return null;

  const params = new URLSearchParams({
    select: 'id,student_id,exam_name,exam_type,exam_date,total_score,total_full_score,class_rank,grade_rank,notes,created_at,updated_at',
    id: `eq.${examId}`,
    limit: '1'
  });
  const rows = await readRows<ExamRecordRow>(buildTablePath(EXAM_RECORDS_TABLE, params.toString()));
  const row = rows[0];

  if (!row) return null;

  const subjectScoresByExam = await fetchSubjectScoresByExamIds([row.id]);
  return mapExamRecord(row, subjectScoresByExam.get(row.id) ?? []);
}

async function replaceExamSubjectScores(examRecordId: string, subjectScores: SubjectScoreInput[]) {
  const deleteQuery = new URLSearchParams({
    exam_record_id: `eq.${examRecordId}`
  });
  const deleteResponse = await supabaseAdminRequest(buildTablePath(SUBJECT_SCORES_TABLE, deleteQuery.toString()), {
    method: 'DELETE',
    headers: {
      Prefer: 'return=minimal'
    }
  });

  if (!deleteResponse) {
    throw new Error('Supabase is not configured.');
  }

  if (subjectScores.length === 0) return;

  const response = await supabaseAdminRequest(buildTablePath(SUBJECT_SCORES_TABLE), {
    method: 'POST',
    headers: {
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(
      subjectScores.map((item) => ({
        exam_record_id: examRecordId,
        subject: item.subject,
        score: item.score,
        full_score: item.fullScore ?? null
      }))
    )
  });

  if (!response) {
    throw new Error('Supabase is not configured.');
  }
}

export async function createExamRecord(input: CreateExamRecordInput): Promise<StudentExamRecord> {
  const response = await supabaseAdminRequest(buildTablePath(EXAM_RECORDS_TABLE), {
    method: 'POST',
    headers: {
      Prefer: 'return=representation'
    },
    body: JSON.stringify({
      student_id: input.studentId,
      exam_name: input.examName.trim(),
      exam_type: input.examType,
      exam_date: input.examDate,
      total_score: input.totalScore,
      total_full_score: input.totalFullScore ?? null,
      class_rank: input.classRank ?? null,
      grade_rank: input.gradeRank ?? null,
      notes: input.notes?.trim() ?? ''
    })
  });

  if (!response) {
    throw new Error('Supabase is not configured.');
  }

  const rows = (await response.json()) as ExamRecordRow[];
  const createdRow = rows[0];

  try {
    await replaceExamSubjectScores(createdRow.id, input.subjectScores);
  } catch (error) {
    await deleteExamRecord(createdRow.id).catch(() => undefined);
    throw error;
  }

  const record = await getExamRecordById(createdRow.id);
  if (!record) {
    throw new Error('Failed to load created exam record.');
  }

  return record;
}

export async function updateExamRecord(examId: string, input: UpdateExamRecordInput): Promise<StudentExamRecord> {
  const query = new URLSearchParams({
    id: `eq.${examId}`
  });

  const response = await supabaseAdminRequest(buildTablePath(EXAM_RECORDS_TABLE, query.toString()), {
    method: 'PATCH',
    headers: {
      Prefer: 'return=representation'
    },
    body: JSON.stringify({
      exam_name: input.examName.trim(),
      exam_type: input.examType,
      exam_date: input.examDate,
      total_score: input.totalScore,
      total_full_score: input.totalFullScore ?? null,
      class_rank: input.classRank ?? null,
      grade_rank: input.gradeRank ?? null,
      notes: input.notes?.trim() ?? ''
    })
  });

  if (!response) {
    throw new Error('Supabase is not configured.');
  }

  await replaceExamSubjectScores(examId, input.subjectScores);
  const record = await getExamRecordById(examId);

  if (!record) {
    throw new Error('Failed to load updated exam record.');
  }

  return record;
}

export async function deleteExamRecord(examId: string): Promise<void> {
  if (!examId) return;

  const query = new URLSearchParams({
    id: `eq.${examId}`
  });
  const response = await supabaseAdminRequest(buildTablePath(EXAM_RECORDS_TABLE, query.toString()), {
    method: 'DELETE',
    headers: {
      Prefer: 'return=minimal'
    }
  });

  if (!response) {
    throw new Error('Supabase is not configured.');
  }
}

export function buildLatestChangeConclusion(records: StudentExamRecord[]): LatestChangeConclusion {
  const ordered = sortRecordsDesc(records);
  const latest = ordered[0];
  const previous = ordered[1];

  if (!latest || !previous) {
    return {
      totalScoreDelta: null,
      classRankDelta: null,
      gradeRankDelta: null,
      bestImprovedSubject: null,
      worstDroppedSubject: null
    };
  }

  const previousScoreBySubject = new Map(previous.subjectScores.map((item) => [item.subject, item]));
  const comparable = latest.subjectScores
    .map((item) => {
      const prev = previousScoreBySubject.get(item.subject);
      if (!prev) return null;

      return {
        subject: item.subject,
        label: SUBJECT_LABELS[item.subject],
        delta: item.score - prev.score
      };
    })
    .filter((item): item is SubjectDelta => item !== null);

  let bestImprovedSubject: SubjectDelta | null = null;
  let worstDroppedSubject: SubjectDelta | null = null;

  if (comparable.length > 0) {
    bestImprovedSubject = comparable.reduce((best, current) => (current.delta > best.delta ? current : best));
    worstDroppedSubject = comparable.reduce((worst, current) => (current.delta < worst.delta ? current : worst));
  }

  return {
    totalScoreDelta: latest.totalScore - previous.totalScore,
    classRankDelta: latest.classRank !== null && previous.classRank !== null ? previous.classRank - latest.classRank : null,
    gradeRankDelta: latest.gradeRank !== null && previous.gradeRank !== null ? previous.gradeRank - latest.gradeRank : null,
    bestImprovedSubject,
    worstDroppedSubject
  };
}

export async function buildStudentTrendSummary(studentId: string): Promise<StudentTrendSummary | null> {
  const student = await getStudentById(studentId);
  if (!student) return null;

  const records = await listStudentExamRecords(studentId);
  const trendPoints = sortRecordsAsc(records).map((record) => ({
    examId: record.id,
    examName: record.examName,
    examDate: record.examDate,
    totalScore: record.totalScore,
    totalFullScore: record.totalFullScore,
    scoreRate: record.totalFullScore && record.totalFullScore > 0 ? (record.totalScore / record.totalFullScore) * 100 : null,
    classRank: record.classRank,
    gradeRank: record.gradeRank
  }));

  return {
    student,
    records,
    trendPoints,
    latestExam: records[0] ?? null,
    latestChange: buildLatestChangeConclusion(records),
    examCount: records.length
  };
}
