import { AdminLoginPanel, AdminSupabaseUnavailablePanel, AdminTokenUnavailablePanel } from '@/components/admin-auth-panels';
import { isAdminAuthorized, isAdminTokenConfigured } from '@/lib/admin-auth';
import { isScoreTrackerStoreEnabled } from '@/lib/score-tracker';

type ScoreTrackerAdminGateOptions = {
  successPath: string;
  searchError?: string;
  title?: string;
  description?: string;
};

type ScoreTrackerAdminErrorBannerProps = {
  error?: string;
};

export function renderScoreTrackerAdminGate({
  successPath,
  searchError,
  title = '成绩追踪后台登录',
  description = '输入后台口令后，即可管理学生成绩台账和趋势看板。'
}: ScoreTrackerAdminGateOptions) {
  if (!isScoreTrackerStoreEnabled()) {
    return <AdminSupabaseUnavailablePanel title="成绩追踪后台" />;
  }

  if (!isAdminTokenConfigured()) {
    return <AdminTokenUnavailablePanel title="成绩追踪后台" />;
  }

  if (!isAdminAuthorized()) {
    return <AdminLoginPanel title={title} description={description} successPath={successPath} error={searchError} />;
  }

  return null;
}

export function ScoreTrackerAdminErrorBanner({ error }: ScoreTrackerAdminErrorBannerProps) {
  if (!error) return null;

  if (error === 'missing-table') {
    return (
      <p className="rounded-lg border border-rose-300/70 bg-rose-50 px-3 py-2 text-sm text-rose-700">
        成绩追踪相关数据表或字段未同步。请先按 README 中的 SQL 在 Supabase 执行建表或补字段。
      </p>
    );
  }

  if (error === 'save-failed') {
    return <p className="rounded-lg border border-rose-300/70 bg-rose-50 px-3 py-2 text-sm text-rose-700">保存失败，请稍后重试。</p>;
  }

  return null;
}
