import 'server-only';

import { buildTablePath, isSupabaseAdminEnabled, supabaseAdminRequest } from '@/lib/supabase-admin';

type VideoOverrideRecord = {
  course_id: string;
  video_url: string;
};

const TABLE_NAME = 'course_video_overrides';

export function isVideoOverrideStoreEnabled() {
  return isSupabaseAdminEnabled();
}

export async function getVideoOverrideByCourseId(courseId: string): Promise<string | null> {
  if (!courseId) return null;

  try {
    const params = new URLSearchParams({
      select: 'video_url',
      course_id: `eq.${courseId}`,
      limit: '1'
    });
    const response = await supabaseAdminRequest(buildTablePath(TABLE_NAME, params.toString()));
    if (!response) return null;

    const rows = (await response.json()) as Array<{ video_url?: string }>;
    const value = rows[0]?.video_url?.trim();
    return value ? value : null;
  } catch (error) {
    console.error('Failed to load video override', error);
    return null;
  }
}

export async function listVideoOverrides(): Promise<Record<string, string>> {
  try {
    const params = new URLSearchParams({
      select: 'course_id,video_url'
    });
    const response = await supabaseAdminRequest(buildTablePath(TABLE_NAME, params.toString()));
    if (!response) return {};

    const rows = (await response.json()) as VideoOverrideRecord[];
    return rows.reduce<Record<string, string>>((acc, row) => {
      const courseId = row.course_id?.trim();
      const videoUrl = row.video_url?.trim();
      if (courseId && videoUrl) {
        acc[courseId] = videoUrl;
      }
      return acc;
    }, {});
  } catch (error) {
    console.error('Failed to list video overrides', error);
    return {};
  }
}

export async function upsertVideoOverride(courseId: string, videoUrl: string): Promise<void> {
  const id = courseId.trim();
  const url = videoUrl.trim();
  if (!id || !url) throw new Error('courseId and videoUrl are required.');

  const response = await supabaseAdminRequest(buildTablePath(TABLE_NAME), {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify({
      course_id: id,
      video_url: url
    })
  });

  if (!response) {
    throw new Error('Supabase is not configured.');
  }
}

export async function deleteVideoOverride(courseId: string): Promise<void> {
  const id = courseId.trim();
  if (!id) return;

  const response = await supabaseAdminRequest(buildTablePath(TABLE_NAME, `course_id=eq.${encodeURIComponent(id)}`), {
    method: 'DELETE',
    headers: {
      Prefer: 'return=minimal'
    }
  });

  if (!response) {
    throw new Error('Supabase is not configured.');
  }
}
