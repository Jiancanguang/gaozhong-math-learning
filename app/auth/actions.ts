'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-auth';

export async function loginWithEmailAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim();
  const password = (formData.get('password') as string) ?? '';

  if (!email || !password) {
    redirect('/auth/login?error=missing-fields' as never);
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect('/auth/login?error=not-configured' as never);
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect('/auth/login?error=invalid-credentials' as never);
  }

  redirect('/dashboard' as never);
}

export async function logoutAction() {
  const supabase = createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect('/auth/login' as never);
}
