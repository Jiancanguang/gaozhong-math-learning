import { redirect } from 'next/navigation';
import { isTeacherAuthorized, isSupabaseAuthConfigured } from '@/lib/supabase-auth';

export async function requireTeacherAuth() {
  if (!isSupabaseAuthConfigured()) {
    redirect('/auth/login?error=not-configured' as never);
  }

  try {
    const authorized = await isTeacherAuthorized();
    if (!authorized) {
      redirect('/auth/login?error=unauthorized' as never);
    }
  } catch (error: unknown) {
    // redirect() throws a special error — re-throw it
    if (typeof error === 'object' && error !== null && 'digest' in error) throw error;
    console.error('requireTeacherAuth error:', error);
    redirect('/auth/login?error=auth-error' as never);
  }
}
