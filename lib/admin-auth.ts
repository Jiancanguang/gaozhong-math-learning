import 'server-only';

import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'admin_token';
const LEGACY_ADMIN_COOKIE_NAME = 'course_admin_token';

export function getAdminToken() {
  return process.env.ADMIN_TOKEN?.trim() || process.env.COURSE_ADMIN_TOKEN?.trim() || '';
}

export function isAdminTokenConfigured() {
  return Boolean(getAdminToken());
}

export function isAdminAuthorized() {
  const token = getAdminToken();
  if (!token) return false;

  const cookieStore = cookies();
  return [ADMIN_COOKIE_NAME, LEGACY_ADMIN_COOKIE_NAME].some((cookieName) => cookieStore.get(cookieName)?.value === token);
}

export function setAdminSessionCookie(value: string) {
  const cookieStore = cookies();
  const options = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  };

  cookieStore.set(ADMIN_COOKIE_NAME, value, options);
  cookieStore.set(LEGACY_ADMIN_COOKIE_NAME, value, options);
}

export function clearAdminSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  cookieStore.delete(LEGACY_ADMIN_COOKIE_NAME);
}

export function validateAdminToken(input: string) {
  const expected = getAdminToken();
  const token = input.trim();

  return Boolean(expected && token && token === expected);
}
