'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { isTeacherAuthorized } from '@/lib/supabase-auth';
import { deleteLesson } from '@/lib/growth-tracker';

export async function deleteLessonAction(lessonId: string) {
  const ok = await isTeacherAuthorized();
  if (!ok) redirect('/auth/login?error=unauthorized' as never);

  try {
    await deleteLesson(lessonId);
    revalidatePath('/history');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('deleteLessonAction error:', error);
  }
  redirect('/history?deleted=1' as never);
}
