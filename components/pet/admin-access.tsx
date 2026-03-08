import { AdminLoginPanel, AdminSupabaseUnavailablePanel, AdminTokenUnavailablePanel } from '@/components/admin-auth-panels';
import { isAdminAuthorized, isAdminTokenConfigured } from '@/lib/admin-auth';
import { isSupabaseAdminEnabled } from '@/lib/supabase-admin';

type PetAdminGateOptions = {
  successPath: string;
  searchError?: string;
};

export function renderPetAdminGate({ successPath, searchError }: PetAdminGateOptions) {
  if (!isSupabaseAdminEnabled()) {
    return <AdminSupabaseUnavailablePanel title="宠物系统后台" />;
  }

  if (!isAdminTokenConfigured()) {
    return <AdminTokenUnavailablePanel title="宠物系统后台" />;
  }

  if (!isAdminAuthorized()) {
    return (
      <AdminLoginPanel
        title="宠物系统后台登录"
        description="输入后台口令后，即可进入班级宠物管理后台。"
        successPath={successPath}
        error={searchError}
      />
    );
  }

  return null;
}

export function PetAdminErrorBanner({ error }: { error?: string }) {
  if (!error) return null;

  if (error === 'missing-table') {
    return (
      <p className="rounded-lg border border-[#e05555]/30 bg-[#f7dede] px-3 py-2 text-sm text-[#e05555]">
        宠物系统数据表还没建好。请先执行迁移脚本，再刷新页面。
      </p>
    );
  }

  if (error === 'save-failed') {
    return <p className="rounded-lg border border-[#e05555]/30 bg-[#f7dede] px-3 py-2 text-sm text-[#e05555]">保存失败，请稍后重试。</p>;
  }

  return null;
}
