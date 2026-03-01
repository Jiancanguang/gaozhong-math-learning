import 'server-only';

type SupabaseAdminConfig = {
  restBaseUrl: string;
  serviceRoleKey: string;
};

export function getSupabaseAdminConfig(): SupabaseAdminConfig | null {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) return null;

  return {
    restBaseUrl: `${url.replace(/\/$/, '')}/rest/v1`,
    serviceRoleKey
  };
}

export function isSupabaseAdminEnabled() {
  return Boolean(getSupabaseAdminConfig());
}

export function assertSafeTableName(tableName: string) {
  if (!/^[a-z_][a-z0-9_]*$/.test(tableName)) {
    throw new Error(`Unsafe table name: ${tableName}`);
  }
}

export function buildTablePath(tableName: string, queryString?: string) {
  assertSafeTableName(tableName);
  return queryString ? `${tableName}?${queryString}` : tableName;
}

export async function supabaseAdminRequest(path: string, init: RequestInit = {}) {
  const config = getSupabaseAdminConfig();
  if (!config) return null;

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
