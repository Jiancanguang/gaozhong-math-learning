'use server';

import { randomUUID } from 'node:crypto';

import { redirect } from 'next/navigation';

import { isAdminAuthorized } from '@/lib/admin-auth';
import { normalizeGrowthV2Mastery } from '@/lib/growth-v2';
import {
  createGrowthGroup,
  createGrowthStudent,
  createGrowthTagCatalogItem,
  createGrowthExam,
  createGrowthLesson,
  deleteGrowthExam,
  deleteGrowthLesson,
  isGrowthV2MasteryLevel,
  isGrowthV2TableMissingError,
  replaceGrowthExamScores,
  replaceGrowthLessonRecords,
  updateGrowthGroup,
  updateGrowthStudent,
  updateGrowthTagCatalogItem,
  updateGrowthExam,
  updateGrowthLesson,
  type CreateGrowthGroupInput,
  type CreateGrowthStudentInput,
  type CreateGrowthTagCatalogInput,
  type SaveGrowthExamScoreInput,
  type SaveGrowthLessonRecordInput
} from '@/lib/growth-v2-store';

function requireAdminAccess() {
  if (!isAdminAuthorized()) {
    redirect('/admin/growth-v2?error=invalid-token');
  }
}

function getTrimmedString(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function parseOptionalNumber(formData: FormData, key: string) {
  const raw = getTrimmedString(formData, key);
  if (!raw) return null;

  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`${key}:validation`);
  }

  return value;
}

function parseOptionalInteger(formData: FormData, key: string) {
  const value = parseOptionalNumber(formData, key);
  return value === null ? null : Math.trunc(value);
}

function getErrorRedirect(path: string, error: unknown) {
  if (isGrowthV2TableMissingError(error)) {
    return `${path}?error=missing-table`;
  }

  if (error instanceof Error && error.message.includes(':validation')) {
    return `${path}?error=validation`;
  }

  if (error instanceof Error && error.message.includes('duplicate key value')) {
    return `${path}?error=duplicate`;
  }

  return `${path}?error=save-failed`;
}

function parseGrowthGroupPayload(formData: FormData): CreateGrowthGroupInput {
  const name = getTrimmedString(formData, 'name');
  const statusRaw = getTrimmedString(formData, 'status');

  if (!name) {
    throw new Error('group:validation');
  }

  if (statusRaw !== 'active' && statusRaw !== 'archived') {
    throw new Error('status:validation');
  }

  return {
    name,
    subject: 'math',
    teacherName: getTrimmedString(formData, 'teacherName'),
    gradeLabel: getTrimmedString(formData, 'gradeLabel'),
    status: statusRaw,
    notes: getTrimmedString(formData, 'notes')
  };
}

function parseGrowthTagCatalogPayload(formData: FormData): CreateGrowthTagCatalogInput {
  const category = getTrimmedString(formData, 'category');
  const tagName = getTrimmedString(formData, 'tagName');
  const sortOrder = parseOptionalInteger(formData, 'sortOrder');
  const isActiveRaw = getTrimmedString(formData, 'isActive');

  if (!category || !tagName) {
    throw new Error('tag:validation');
  }

  if (sortOrder !== null && sortOrder < 0) {
    throw new Error('sortOrder:validation');
  }

  if (isActiveRaw !== 'true' && isActiveRaw !== 'false') {
    throw new Error('isActive:validation');
  }

  return {
    scope: 'exam',
    category,
    tagName,
    sortOrder: sortOrder ?? 0,
    isActive: isActiveRaw === 'true'
  };
}

function parseGrowthStudentPayload(formData: FormData): Omit<CreateGrowthStudentInput, 'parentAccessToken'> {
  const name = getTrimmedString(formData, 'name');
  const gradeLabel = getTrimmedString(formData, 'gradeLabel');
  const statusRaw = getTrimmedString(formData, 'status');

  if (!name || !gradeLabel) {
    throw new Error('student:validation');
  }

  if (statusRaw !== 'active' && statusRaw !== 'archived') {
    throw new Error('status:validation');
  }

  return {
    name,
    gradeLabel,
    homeGroupId: getTrimmedString(formData, 'homeGroupId') || null,
    status: statusRaw,
    notes: getTrimmedString(formData, 'notes')
  };
}

function parseGrowthLessonPayload(formData: FormData) {
  const groupId = getTrimmedString(formData, 'groupId');
  const lessonDate = getTrimmedString(formData, 'lessonDate');
  const topic = getTrimmedString(formData, 'topic');
  const testTotal = parseOptionalNumber(formData, 'testTotal');

  if (!groupId || !lessonDate || !topic) {
    throw new Error('lesson:validation');
  }

  if (testTotal !== null && testTotal <= 0) {
    throw new Error('testTotal:validation');
  }

  const records: SaveGrowthLessonRecordInput[] = [];
  let index = 0;

  while (formData.has(`students[${index}].id`)) {
    const masteryRaw = normalizeGrowthV2Mastery(getTrimmedString(formData, `students[${index}].masteryLevel`));
    records.push({
      studentId: getTrimmedString(formData, `students[${index}].id`),
      isGuest: getTrimmedString(formData, `students[${index}].isGuest`) === 'true',
      entryScore: parseOptionalNumber(formData, `students[${index}].entryScore`),
      exitScore: parseOptionalNumber(formData, `students[${index}].exitScore`),
      performance: parseOptionalInteger(formData, `students[${index}].performance`),
      masteryLevel: isGrowthV2MasteryLevel(masteryRaw) ? masteryRaw : null,
      comment: getTrimmedString(formData, `students[${index}].comment`)
    });
    index += 1;
  }

  return {
    lesson: {
      groupId,
      lessonDate,
      timeStart: getTrimmedString(formData, 'timeStart') || null,
      timeEnd: getTrimmedString(formData, 'timeEnd') || null,
      topic,
      entryTestTopic: getTrimmedString(formData, 'entryTestTopic'),
      exitTestTopic: getTrimmedString(formData, 'exitTestTopic'),
      testTotal,
      homework: getTrimmedString(formData, 'homework'),
      keyPoints: getTrimmedString(formData, 'keyPoints'),
      notes: getTrimmedString(formData, 'notes')
    },
    records
  };
}

function parseGrowthExamPayload(formData: FormData) {
  const groupId = getTrimmedString(formData, 'groupId');
  const name = getTrimmedString(formData, 'name');
  const examDate = getTrimmedString(formData, 'examDate');
  const examTypeRaw = getTrimmedString(formData, 'examType');
  const totalScore = parseOptionalNumber(formData, 'totalScore');

  if (!groupId || !name || !examDate || !totalScore) {
    throw new Error('exam:validation');
  }

  if (examTypeRaw !== 'school' && examTypeRaw !== 'internal' && examTypeRaw !== 'other') {
    throw new Error('examType:validation');
  }

  const examType: 'school' | 'internal' | 'other' = examTypeRaw;

  if (totalScore <= 0) {
    throw new Error('totalScore:validation');
  }

  const scores: SaveGrowthExamScoreInput[] = [];
  let index = 0;

  while (formData.has(`students[${index}].id`)) {
    const masteryRaw = normalizeGrowthV2Mastery(getTrimmedString(formData, `students[${index}].masteryLevel`));
    const tagNames = getTrimmedString(formData, `students[${index}].tagNames`)
      .split(/[\n,，、]+/)
      .map((tagName) => tagName.trim())
      .filter(Boolean);

    scores.push({
      studentId: getTrimmedString(formData, `students[${index}].id`),
      score: parseOptionalNumber(formData, `students[${index}].score`),
      classRank: parseOptionalInteger(formData, `students[${index}].classRank`),
      gradeRank: parseOptionalInteger(formData, `students[${index}].gradeRank`),
      masteryLevel: isGrowthV2MasteryLevel(masteryRaw) ? masteryRaw : null,
      note: getTrimmedString(formData, `students[${index}].note`),
      tagNames
    });
    index += 1;
  }

  return {
    exam: {
      groupId,
      name,
      examDate,
      examType,
      subject: getTrimmedString(formData, 'subject') || '数学',
      totalScore,
      notes: getTrimmedString(formData, 'notes')
    },
    scores
  };
}

function generateGrowthParentAccessToken() {
  return `gv2_${randomUUID().replace(/-/g, '')}`;
}

function isParentTokenConflict(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('parent_access_token') && message.includes('duplicate');
}

export async function createGrowthGroupAction(formData: FormData) {
  requireAdminAccess();

  let targetPath = '/admin/growth-v2/groups/new';

  try {
    const payload = parseGrowthGroupPayload(formData);
    const group = await createGrowthGroup(payload);
    targetPath = `/admin/growth-v2/groups?saved=${group.id}`;
  } catch (error) {
    targetPath = getErrorRedirect('/admin/growth-v2/groups/new', error);
  }

  redirect(targetPath);
}

export async function createGrowthTagCatalogAction(formData: FormData) {
  requireAdminAccess();

  let targetPath = '/admin/growth-v2/tags/new';

  try {
    const payload = parseGrowthTagCatalogPayload(formData);
    const tag = await createGrowthTagCatalogItem(payload);
    targetPath = `/admin/growth-v2/tags?saved=${tag.id}`;
  } catch (error) {
    targetPath = getErrorRedirect('/admin/growth-v2/tags/new', error);
  }

  redirect(targetPath);
}

export async function updateGrowthGroupAction(groupId: string, formData: FormData) {
  requireAdminAccess();

  let targetPath = `/admin/growth-v2/groups/${groupId}/edit`;

  try {
    const payload = parseGrowthGroupPayload(formData);
    await updateGrowthGroup(groupId, payload);
    targetPath = `/admin/growth-v2/groups?saved=${groupId}`;
  } catch (error) {
    targetPath = getErrorRedirect(`/admin/growth-v2/groups/${groupId}/edit`, error);
  }

  redirect(targetPath);
}

export async function updateGrowthTagCatalogAction(tagId: string, formData: FormData) {
  requireAdminAccess();

  let targetPath = `/admin/growth-v2/tags/${tagId}/edit`;

  try {
    const payload = parseGrowthTagCatalogPayload(formData);
    await updateGrowthTagCatalogItem(tagId, payload);
    targetPath = `/admin/growth-v2/tags?saved=${tagId}`;
  } catch (error) {
    targetPath = getErrorRedirect(`/admin/growth-v2/tags/${tagId}/edit`, error);
  }

  redirect(targetPath);
}

export async function createGrowthStudentAction(formData: FormData) {
  requireAdminAccess();

  let targetPath = '/admin/growth-v2/students/new';

  try {
    const payload = parseGrowthStudentPayload(formData);

    let student = null;
    let attempts = 0;

    while (!student && attempts < 3) {
      attempts += 1;

      try {
        student = await createGrowthStudent({
          ...payload,
          parentAccessToken: generateGrowthParentAccessToken()
        });
      } catch (error) {
        if (attempts < 3 && isParentTokenConflict(error)) {
          continue;
        }

        throw error;
      }
    }

    if (!student) {
      throw new Error('student:save-failed');
    }

    targetPath = `/admin/growth-v2/students/${student.id}?saved=student`;
  } catch (error) {
    targetPath = getErrorRedirect('/admin/growth-v2/students/new', error);
  }

  redirect(targetPath);
}

export async function updateGrowthStudentAction(studentId: string, formData: FormData) {
  requireAdminAccess();

  let targetPath = `/admin/growth-v2/students/${studentId}/edit`;

  try {
    const payload = parseGrowthStudentPayload(formData);
    await updateGrowthStudent(studentId, payload);
    targetPath = `/admin/growth-v2/students/${studentId}?saved=student`;
  } catch (error) {
    targetPath = getErrorRedirect(`/admin/growth-v2/students/${studentId}/edit`, error);
  }

  redirect(targetPath);
}

export async function createGrowthLessonAction(formData: FormData) {
  requireAdminAccess();

  let targetPath = '/admin/growth-v2/lessons';

  try {
    const payload = parseGrowthLessonPayload(formData);
    const lesson = await createGrowthLesson(payload.lesson);
    await replaceGrowthLessonRecords(lesson.id, payload.records);
    targetPath = '/admin/growth-v2/lessons?saved=1';
  } catch (error) {
    targetPath = getErrorRedirect('/admin/growth-v2/lessons', error);
  }

  redirect(targetPath);
}

export async function updateGrowthLessonAction(lessonId: string, formData: FormData) {
  requireAdminAccess();

  let targetPath = `/admin/growth-v2/lessons/${lessonId}`;

  try {
    const payload = parseGrowthLessonPayload(formData);
    await updateGrowthLesson(lessonId, payload.lesson);
    await replaceGrowthLessonRecords(lessonId, payload.records);
    targetPath = `/admin/growth-v2/lessons/${lessonId}?saved=1`;
  } catch (error) {
    targetPath = getErrorRedirect(`/admin/growth-v2/lessons/${lessonId}`, error);
  }

  redirect(targetPath);
}

export async function deleteGrowthLessonAction(lessonId: string) {
  requireAdminAccess();

  let targetPath = '/admin/growth-v2/lessons';

  try {
    await deleteGrowthLesson(lessonId);
    targetPath = '/admin/growth-v2/lessons?deleted=1';
  } catch (error) {
    targetPath = getErrorRedirect(`/admin/growth-v2/lessons/${lessonId}`, error);
  }

  redirect(targetPath);
}

export async function createGrowthExamAction(formData: FormData) {
  requireAdminAccess();

  let targetPath = '/admin/growth-v2/exams';

  try {
    const payload = parseGrowthExamPayload(formData);
    const exam = await createGrowthExam(payload.exam);
    await replaceGrowthExamScores(exam.id, payload.scores);
    targetPath = '/admin/growth-v2/exams?saved=1';
  } catch (error) {
    targetPath = getErrorRedirect('/admin/growth-v2/exams', error);
  }

  redirect(targetPath);
}

export async function updateGrowthExamAction(examId: string, formData: FormData) {
  requireAdminAccess();

  let targetPath = `/admin/growth-v2/exams/${examId}`;

  try {
    const payload = parseGrowthExamPayload(formData);
    await updateGrowthExam(examId, payload.exam);
    await replaceGrowthExamScores(examId, payload.scores);
    targetPath = `/admin/growth-v2/exams/${examId}?saved=1`;
  } catch (error) {
    targetPath = getErrorRedirect(`/admin/growth-v2/exams/${examId}`, error);
  }

  redirect(targetPath);
}

export async function deleteGrowthExamAction(examId: string) {
  requireAdminAccess();

  let targetPath = '/admin/growth-v2/exams';

  try {
    await deleteGrowthExam(examId);
    targetPath = '/admin/growth-v2/exams?deleted=1';
  } catch (error) {
    targetPath = getErrorRedirect(`/admin/growth-v2/exams/${examId}`, error);
  }

  redirect(targetPath);
}
