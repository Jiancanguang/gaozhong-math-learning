import { loginAdminAction, logoutAdminAction } from '@/app/admin/auth-actions';

type PanelProps = {
  title: string;
  message?: string;
  maxWidthClassName?: string;
};

type LoginPanelProps = {
  title: string;
  description: string;
  successPath: string;
  error?: string;
  maxWidthClassName?: string;
};

type LogoutButtonProps = {
  redirectPath: string;
  label?: string;
};

function PanelContainer({ children, maxWidthClassName = 'max-w-3xl' }: { children: React.ReactNode; maxWidthClassName?: string }) {
  return <div className={`mx-auto w-full ${maxWidthClassName} px-4 pb-12 pt-8 sm:px-6 lg:px-8`}>{children}</div>;
}

export function AdminSupabaseUnavailablePanel({
  title,
  message = '未检测到 Supabase 配置。请先在环境变量中设置 `SUPABASE_URL` 与 `SUPABASE_SERVICE_ROLE_KEY`，再刷新本页。',
  maxWidthClassName
}: PanelProps) {
  return (
    <PanelContainer maxWidthClassName={maxWidthClassName}>
      <h1 className="text-3xl font-semibold text-tide">{title}</h1>
      <p className="mt-3 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900">{message}</p>
    </PanelContainer>
  );
}

export function AdminTokenUnavailablePanel({
  title,
  message = '未设置 `ADMIN_TOKEN`（可回退 `COURSE_ADMIN_TOKEN`），后台已禁用。请先配置后台口令环境变量。',
  maxWidthClassName
}: PanelProps) {
  return (
    <PanelContainer maxWidthClassName={maxWidthClassName}>
      <h1 className="text-3xl font-semibold text-tide">{title}</h1>
      <p className="mt-3 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900">{message}</p>
    </PanelContainer>
  );
}

export function AdminLoginPanel({ title, description, successPath, error, maxWidthClassName = 'max-w-md' }: LoginPanelProps) {
  const loginAction = loginAdminAction.bind(null, successPath, `${successPath}?error=invalid-token`);

  return (
    <PanelContainer maxWidthClassName={maxWidthClassName}>
      <h1 className="text-3xl font-semibold text-tide">{title}</h1>
      <p className="mt-3 text-sm text-ink/70">{description}</p>
      {error === 'invalid-token' ? (
        <p className="mt-3 rounded-lg border border-rose-300/70 bg-rose-50 px-3 py-2 text-sm text-rose-700">口令不正确，请重新输入。</p>
      ) : null}
      <form action={loginAction} className="mt-6 rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
        <label htmlFor="token" className="text-sm font-medium text-ink">
          后台口令
        </label>
        <input
          id="token"
          name="token"
          type="password"
          required
          className="mt-2 w-full rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button type="submit" className="mt-4 w-full rounded-lg bg-tide px-4 py-2 text-sm font-medium text-white transition hover:bg-tide/90">
          登录
        </button>
      </form>
    </PanelContainer>
  );
}

export function AdminLogoutButton({ redirectPath, label = '退出登录' }: LogoutButtonProps) {
  const logoutAction = logoutAdminAction.bind(null, redirectPath);

  return (
    <form action={logoutAction}>
      <button type="submit" className="rounded-lg border border-tide/20 bg-white px-4 py-2 text-sm text-ink transition hover:border-accent/40">
        {label}
      </button>
    </form>
  );
}
