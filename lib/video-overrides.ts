type VideoOverrideRecord = {
  course_id: string;
  video_url: string;
};

const TABLE_NAME = 'course_video_overrides';

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) return null;

  return {
    restBaseUrl: `${url.replace(/\/$/, '')}/rest/v1`,
    serviceRoleKey
  };
}

function isTableNameSafe(tableName: string) {
  return /^[a-z_][a-z0-9_]*$/.test(tableName);
}

async function supabaseRequest(path: string, init: RequestInit = {}) {
  const config = getSupabaseConfig();
  if (!config) return null;

  if (!isTableNameSafe(TABLE_NAME)) {
    throw new Error(`Unsafe table name: ${TABLE_NAME}`);
  }

  const response = await fetch(`${config.restBaseUrl}/${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...init.headers
    }
  });

  if (!response.ok) {
    const reason = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${reason}`);
  }

  return response;
}

export function isVideoOverrideStoreEnabled() {
  return Boolean(getSupabaseConfig());
}

export async function getVideoOverrideByCourseId(courseId: string): Promise<string | null> {
  if (!courseId) return null;

  try {
    const params = new URLSearchParams({
      select: 'video_url',
      course_id: `eq.${courseId}`,
      limit: '1'
    });
    const response = await supabaseRequest(`${TABLE_NAME}?${params.toString()}`);
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
    const response = await supabaseRequest(`${TABLE_NAME}?${params.toString()}`);
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

  const response = await supabaseRequest(`${TABLE_NAME}`, {
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

  const response = await supabaseRequest(`${TABLE_NAME}?course_id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      Prefer: 'return=minimal'
    }
  });

  if (!response) {
    throw new Error('Supabase is not configured.');
  }
}
