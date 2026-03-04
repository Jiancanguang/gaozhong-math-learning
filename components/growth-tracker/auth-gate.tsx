import { redirect } from 'next/navigation';
import { isTeacherAuthorized, isSupabaseAuthConfigured } from '@/lib/supabase-auth';

export async function requireTeacherAuth() {
  if (!isSupabaseAuthConfigured()) {
    redirect('/auth/login?error=not-configured' as never);
  }

  const authorized = await isTeacherAuthorized();
  if (!authorized) {
    redirect('/auth/login?error=unauthorized' as never);
  }
}
