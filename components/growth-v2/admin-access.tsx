import { AdminLoginPanel, AdminSupabaseUnavailablePanel, AdminTokenUnavailablePanel } from '@/components/admin-auth-panels';
import { isAdminAuthorized, isAdminTokenConfigured } from '@/lib/admin-auth';
import { isSupabaseAdminEnabled } from '@/lib/supabase-admin';

type GrowthV2AdminGateOptions = {
  successPath: string;
  searchError?: string;
  title?: string;
  description?: string;
};

export function renderGrowthV2AdminGate({
  successPath,
  searchError,
  title = 'Growth V2 后台登录',
  description = '输入后台口令后，即可进入 Growth V2 的老师后台骨架。'
}: GrowthV2AdminGateOptions) {
  if (!isSupabaseAdminEnabled()) {
    return <AdminSupabaseUnavailablePanel title="Growth V2 后台" />;
  }

  if (!isAdminTokenConfigured()) {
    return <AdminTokenUnavailablePanel title="Growth V2 后台" />;
  }

  if (!isAdminAuthorized()) {
    return <AdminLoginPanel title={title} description={description} successPath={successPath} error={searchError} />;
  }

  return null;
}

export function GrowthV2AdminErrorBanner({ error }: { error?: string }) {
  if (!error) return null;

  if (error === 'missing-table') {
    return (
      <p className="rounded-lg border border-rose-300/70 bg-rose-50 px-3 py-2 text-sm text-rose-700">
        Growth V2 相关数据表还没建好。请先执行 `docs/growth-v2-schema.sql`，再刷新页面。
      </p>
    );
  }

  if (error === 'save-failed') {
    return <p className="rounded-lg border border-rose-300/70 bg-rose-50 px-3 py-2 text-sm text-rose-700">保存失败，请稍后重试。</p>;
  }

  return null;
}
