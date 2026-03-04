'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { isTeacherAuthorized } from '@/lib/supabase-auth';
import { createStudent, updateStudent, type Grade, isGrade } from '@/lib/score-tracker';

async function requireAuth() {
  const ok = await isTeacherAuthorized();
  if (!ok) redirect('/auth/login?error=unauthorized' as never);
}

function generateParentToken() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 12; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export async function createStudentAction(formData: FormData) {
  await requireAuth();

  const name = (formData.get('name') as string)?.trim();
  const grade = (formData.get('grade') as string)?.trim();
  const groupName = (formData.get('groupName') as string)?.trim() ?? '';

  if (!name || !grade || !isGrade(grade)) {
    redirect('/students/new?error=validation' as never);
  }

  try {
    const student = await createStudent({
      name,
      grade: grade as Grade,
      className: groupName,
      groupName,
      parentToken: generateParentToken(),
      status: 'active',
      isActive: true
    });
    revalidatePath('/students');
    redirect(`/students/${student.id}?saved=student` as never);
  } catch (error: unknown) {
    // redirect() throws a special error that should not be caught
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error;
    if (typeof error === 'object' && error !== null && 'digest' in error) throw error;
    const message = error instanceof Error ? error.message : 'unknown';
    console.error('createStudentAction error:', message);
    redirect(`/students/new?error=${encodeURIComponent(message)}` as never);
  }
}

export async function updateStudentAction(studentId: string, formData: FormData) {
  await requireAuth();

  const name = (formData.get('name') as string)?.trim();
  const grade = (formData.get('grade') as string)?.trim();
  const groupName = (formData.get('groupName') as string)?.trim() ?? '';
  const status = (formData.get('status') as string)?.trim() === 'archived' ? 'archived' : 'active';

  if (!name || !grade || !isGrade(grade)) {
    redirect(`/students/${studentId}/edit?error=validation` as never);
  }

  try {
    await updateStudent(studentId, {
      name,
      grade: grade as Grade,
      className: groupName,
      groupName,
      isActive: status === 'active',
      status: status as 'active' | 'archived'
    });
    revalidatePath('/students');
    redirect(`/students/${studentId}?saved=student` as never);
  } catch (error: unknown) {
    // redirect() throws a special error that should not be caught
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error;
    if (typeof error === 'object' && error !== null && 'digest' in error) throw error;
    const message = error instanceof Error ? error.message : 'unknown';
    console.error('updateStudentAction error:', message);
    redirect(`/students/${studentId}/edit?error=save-failed` as never);
  }
}

export async function archiveStudentAction(studentId: string) {
  await requireAuth();

  try {
    const student = await import('@/lib/score-tracker').then((m) => m.getStudentById(studentId));
    if (!student) return;

    await updateStudent(studentId, {
      name: student.name,
      grade: student.grade,
      className: student.className,
      groupName: student.groupName,
      isActive: false,
      status: 'archived'
    });
    revalidatePath('/students');
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error;
    if (typeof error === 'object' && error !== null && 'digest' in error) throw error;
    console.error('archiveStudentAction error:', error);
  }
}
