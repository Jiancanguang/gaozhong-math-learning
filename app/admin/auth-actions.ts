'use server';

import { redirect } from 'next/navigation';

import { clearAdminSessionCookie, setAdminSessionCookie, validateAdminToken } from '@/lib/admin-auth';

export async function loginAdminAction(successPath: string, errorPath: string, formData: FormData) {
  const input = String(formData.get('token') ?? '');

  if (!validateAdminToken(input)) {
    redirect(errorPath);
  }

  setAdminSessionCookie(input.trim());
  redirect(successPath);
}

export async function logoutAdminAction(redirectPath: string) {
  clearAdminSessionCookie();
  redirect(redirectPath);
}
