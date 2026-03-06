'use server';

import { redirect } from 'next/navigation';

import { isAdminAuthorized } from '@/lib/admin-auth';
import { normalizeGrowthV2Mastery } from '@/lib/growth-v2';
import {
  createGrowthExam,
  createGrowthLesson,
  isGrowthV2MasteryLevel,
  isGrowthV2TableMissingError,
  replaceGrowthExamScores,
  replaceGrowthLessonRecords,
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

  return `${path}?error=save-failed`;
}

export async function createGrowthLessonAction(formData: FormData) {
  requireAdminAccess();

  let targetPath = '/admin/growth-v2/lessons';

  try {
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

    const lesson = await createGrowthLesson({
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
    });

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

    await replaceGrowthLessonRecords(lesson.id, records);
    targetPath = '/admin/growth-v2/lessons?saved=1';
  } catch (error) {
    targetPath = getErrorRedirect('/admin/growth-v2/lessons', error);
  }

  redirect(targetPath);
}

export async function createGrowthExamAction(formData: FormData) {
  requireAdminAccess();

  let targetPath = '/admin/growth-v2/exams';

  try {
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

    if (totalScore <= 0) {
      throw new Error('totalScore:validation');
    }

    const exam = await createGrowthExam({
      groupId,
      name,
      examDate,
      examType: examTypeRaw,
      subject: getTrimmedString(formData, 'subject') || '数学',
      totalScore,
      notes: getTrimmedString(formData, 'notes')
    });

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

    await replaceGrowthExamScores(exam.id, scores);
    targetPath = '/admin/growth-v2/exams?saved=1';
  } catch (error) {
    targetPath = getErrorRedirect('/admin/growth-v2/exams', error);
  }

  redirect(targetPath);
}
