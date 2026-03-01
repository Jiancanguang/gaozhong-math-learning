'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { isAdminAuthorized } from '@/lib/admin-auth';
import {
  SUBJECTS,
  createExamRecord,
  createStudent,
  deleteExamRecord,
  isExamType,
  isGrade,
  isScoreTrackerTableMissingError,
  updateExamRecord,
  updateStudent
} from '@/lib/score-tracker';

function requireAdminAccess() {
  if (!isAdminAuthorized()) {
    redirect('/admin/score-tracker?error=invalid-token');
  }
}

function getTrimmedString(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function parseBoolean(formData: FormData, key: string) {
  return getTrimmedString(formData, key) !== 'false';
}

function parseRequiredNumber(formData: FormData, key: string) {
  const raw = getTrimmedString(formData, key);
  if (!raw) {
    throw new Error(`${key} is required.`);
  }

  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`${key} must be a valid number.`);
  }

  return value;
}

function parseOptionalNumber(formData: FormData, key: string) {
  const raw = getTrimmedString(formData, key);
  if (!raw) return null;

  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`${key} must be a valid number.`);
  }

  return value;
}

function parseOptionalInteger(formData: FormData, key: string) {
  const value = parseOptionalNumber(formData, key);
  return value === null ? null : Math.trunc(value);
}

function buildSubjectScores(formData: FormData) {
  return SUBJECTS.flatMap((subject) => {
    const score = parseOptionalNumber(formData, `${subject}Score`);
    if (score === null) return [];

    return [
      {
        subject,
        score,
        fullScore: parseOptionalNumber(formData, `${subject}FullScore`)
      }
    ];
  });
}

function getErrorRedirect(path: string, error: unknown) {
  if (isScoreTrackerTableMissingError(error)) {
    return `${path}?error=missing-table`;
  }

  return `${path}?error=save-failed`;
}

function revalidateScoreTrackerRoutes(studentId?: string) {
  revalidatePath('/admin/score-tracker');
  if (!studentId) return;

  revalidatePath(`/admin/score-tracker/students/${studentId}`);
  revalidatePath(`/admin/score-tracker/students/${studentId}/edit`);
  revalidatePath(`/admin/score-tracker/students/${studentId}/exams/new`);
}

export async function createStudentAction(formData: FormData) {
  requireAdminAccess();

  let targetPath = '/admin/score-tracker/students/new';

  try {
    const grade = getTrimmedString(formData, 'grade');
    if (!isGrade(grade)) {
      throw new Error('grade is invalid.');
    }

    const student = await createStudent({
      name: getTrimmedString(formData, 'name'),
      grade,
      className: getTrimmedString(formData, 'className'),
      headTeacher: getTrimmedString(formData, 'headTeacher'),
      isActive: parseBoolean(formData, 'isActive'),
      notes: getTrimmedString(formData, 'notes')
    });

    revalidateScoreTrackerRoutes(student.id);
    targetPath = `/admin/score-tracker/students/${student.id}?saved=student`;
  } catch (error) {
    targetPath = getErrorRedirect('/admin/score-tracker/students/new', error);
  }

  redirect(targetPath);
}

export async function updateStudentAction(studentId: string, formData: FormData) {
  requireAdminAccess();

  let targetPath = `/admin/score-tracker/students/${studentId}/edit`;

  try {
    const grade = getTrimmedString(formData, 'grade');
    if (!isGrade(grade)) {
      throw new Error('grade is invalid.');
    }

    await updateStudent(studentId, {
      name: getTrimmedString(formData, 'name'),
      grade,
      className: getTrimmedString(formData, 'className'),
      headTeacher: getTrimmedString(formData, 'headTeacher'),
      isActive: parseBoolean(formData, 'isActive'),
      notes: getTrimmedString(formData, 'notes')
    });

    revalidateScoreTrackerRoutes(studentId);
    targetPath = `/admin/score-tracker/students/${studentId}?saved=student`;
  } catch (error) {
    targetPath = getErrorRedirect(`/admin/score-tracker/students/${studentId}/edit`, error);
  }

  redirect(targetPath);
}

export async function createExamAction(studentId: string, formData: FormData) {
  requireAdminAccess();

  let targetPath = `/admin/score-tracker/students/${studentId}/exams/new`;

  try {
    const examType = getTrimmedString(formData, 'examType');
    if (!isExamType(examType)) {
      throw new Error('examType is invalid.');
    }

    await createExamRecord({
      studentId,
      examName: getTrimmedString(formData, 'examName'),
      examType,
      examDate: getTrimmedString(formData, 'examDate'),
      totalScore: parseRequiredNumber(formData, 'totalScore'),
      totalFullScore: parseOptionalNumber(formData, 'totalFullScore'),
      classRank: parseOptionalInteger(formData, 'classRank'),
      gradeRank: parseOptionalInteger(formData, 'gradeRank'),
      notes: getTrimmedString(formData, 'notes'),
      subjectScores: buildSubjectScores(formData)
    });

    revalidateScoreTrackerRoutes(studentId);
    targetPath = `/admin/score-tracker/students/${studentId}?saved=exam`;
  } catch (error) {
    targetPath = getErrorRedirect(`/admin/score-tracker/students/${studentId}/exams/new`, error);
  }

  redirect(targetPath);
}

export async function updateExamAction(studentId: string, examId: string, formData: FormData) {
  requireAdminAccess();

  let targetPath = `/admin/score-tracker/students/${studentId}/exams/${examId}/edit`;

  try {
    const examType = getTrimmedString(formData, 'examType');
    if (!isExamType(examType)) {
      throw new Error('examType is invalid.');
    }

    await updateExamRecord(examId, {
      examName: getTrimmedString(formData, 'examName'),
      examType,
      examDate: getTrimmedString(formData, 'examDate'),
      totalScore: parseRequiredNumber(formData, 'totalScore'),
      totalFullScore: parseOptionalNumber(formData, 'totalFullScore'),
      classRank: parseOptionalInteger(formData, 'classRank'),
      gradeRank: parseOptionalInteger(formData, 'gradeRank'),
      notes: getTrimmedString(formData, 'notes'),
      subjectScores: buildSubjectScores(formData)
    });

    revalidateScoreTrackerRoutes(studentId);
    revalidatePath(`/admin/score-tracker/students/${studentId}/exams/${examId}/edit`);
    targetPath = `/admin/score-tracker/students/${studentId}?saved=exam`;
  } catch (error) {
    targetPath = getErrorRedirect(`/admin/score-tracker/students/${studentId}/exams/${examId}/edit`, error);
  }

  redirect(targetPath);
}

export async function deleteExamAction(studentId: string, examId: string) {
  requireAdminAccess();

  let targetPath = `/admin/score-tracker/students/${studentId}/exams/${examId}/edit`;

  try {
    await deleteExamRecord(examId);
    revalidateScoreTrackerRoutes(studentId);
    revalidatePath(`/admin/score-tracker/students/${studentId}/exams/${examId}/edit`);
    targetPath = `/admin/score-tracker/students/${studentId}?deleted=exam`;
  } catch (error) {
    targetPath = getErrorRedirect(`/admin/score-tracker/students/${studentId}/exams/${examId}/edit`, error);
  }

  redirect(targetPath);
}
