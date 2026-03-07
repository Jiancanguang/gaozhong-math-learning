import type { Metadata } from 'next';
import { loginWithEmailAction } from '@/app/auth/actions';

export const metadata: Metadata = {
  title: '教师登录 — 筑学工作室'
};

type Props = {
  searchParams: { error?: string };
};

const errorMessages: Record<string, string> = {
  'missing-fields': '请输入邮箱和密码。',
  'invalid-credentials': '邮箱或密码不正确，请重新输入。',
  'not-configured': '未检测到 Supabase Auth 配置。请设置环境变量后重试。',
  'unauthorized': '请先登录后再访问。'
};

export default function LoginPage({ searchParams }: Props) {
  const error = searchParams.error;
  const errorMessage = error ? errorMessages[error] ?? '登录出错，请重试。' : null;

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-12 pt-16 sm:px-6">
      <h1 className="text-center text-3xl font-semibold text-gt-primary">筑学工作室</h1>
      <p className="mt-2 text-center text-sm text-ink/60">教师端登录</p>

      {errorMessage ? (
        <p className="mt-6 rounded-lg border border-[#e05555]/30 bg-[#f7dede] px-3 py-2 text-sm text-[#e05555]">{errorMessage}</p>
      ) : null}

      <form action={loginWithEmailAction} className="mt-8 rounded-2xl border border-gt-primary/10 bg-white/90 p-6 shadow-card">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-ink">
            邮箱
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2 w-full rounded-lg border border-gt-primary/20 bg-white px-3 py-2 text-sm outline-none focus:border-gt-accent"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="password" className="text-sm font-medium text-ink">
            密码
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-2 w-full rounded-lg border border-gt-primary/20 bg-white px-3 py-2 text-sm outline-none focus:border-gt-accent"
          />
        </div>
        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-gt-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gt-primary/90"
        >
          登录
        </button>
      </form>
    </div>
  );
}
