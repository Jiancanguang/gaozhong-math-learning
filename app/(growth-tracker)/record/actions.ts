'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { isTeacherAuthorized } from '@/lib/supabase-auth';
import { createLesson, saveLessonRecords, type MasteryLevel, MASTERY_LEVELS } from '@/lib/growth-tracker';

export async function saveBatchRecordAction(formData: FormData) {
  const ok = await isTeacherAuthorized();
  if (!ok) redirect('/auth/login?error=unauthorized' as never);

  const groupName = (formData.get('groupName') as string)?.trim();
  const date = (formData.get('date') as string)?.trim();
  const topic = (formData.get('topic') as string)?.trim();
  const entryTestTopic = (formData.get('entryTestTopic') as string)?.trim() ?? '';
  const exitTestTopic = (formData.get('exitTestTopic') as string)?.trim() ?? '';

  if (!groupName || !date || !topic) {
    redirect('/record?error=validation' as never);
  }

  try {
    const lesson = await createLesson({
      date,
      groupName,
      topic,
      entryTestTopic,
      exitTestTopic
    });

    // Parse student records from formData
    const studentIds: string[] = [];
    let i = 0;
    while (formData.has(`students[${i}].id`)) {
      studentIds.push(formData.get(`students[${i}].id`) as string);
      i++;
    }

    const records = studentIds.map((studentId, idx) => {
      const entryRaw = formData.get(`students[${idx}].entryScore`) as string;
      const exitRaw = formData.get(`students[${idx}].exitScore`) as string;
      const perfRaw = formData.get(`students[${idx}].performance`) as string;
      const masteryRaw = (formData.get(`students[${idx}].mastery`) as string)?.trim();
      const comment = (formData.get(`students[${idx}].comment`) as string)?.trim() ?? '';

      const entryScore = entryRaw !== '' && entryRaw != null ? Number(entryRaw) : null;
      const exitScore = exitRaw !== '' && exitRaw != null ? Number(exitRaw) : null;
      const performance = perfRaw !== '' && perfRaw != null ? Number(perfRaw) : null;
      const mastery = (MASTERY_LEVELS as readonly string[]).includes(masteryRaw) ? (masteryRaw as MasteryLevel) : null;

      return {
        studentId,
        entryScore: entryScore != null && Number.isFinite(entryScore) ? entryScore : null,
        exitScore: exitScore != null && Number.isFinite(exitScore) ? exitScore : null,
        performance: performance != null && Number.isFinite(performance) ? performance : null,
        mastery,
        comment
      };
    });

    await saveLessonRecords(lesson.id, records);

    revalidatePath('/record');
    revalidatePath('/dashboard');
    revalidatePath('/history');
    redirect('/record?success=1' as never);
  } catch (error) {
    if ((error as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('saveBatchRecordAction error:', error);
    redirect('/record?error=save-failed' as never);
  }
}
