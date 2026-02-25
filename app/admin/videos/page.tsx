import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getAllCourses, mapChapterName, toEmbedVideoUrl } from '@/lib/courses';
import { deleteVideoOverride, isVideoOverrideStoreEnabled, listVideoOverrides, upsertVideoOverride } from '@/lib/video-overrides';

const ADMIN_COOKIE_NAME = 'course_admin_token';

function getAdminToken() {
  return process.env.COURSE_ADMIN_TOKEN?.trim() ?? '';
}

function isAuthorized() {
  const token = getAdminToken();
  if (!token) return false;
  return cookies().get(ADMIN_COOKIE_NAME)?.value === token;
}

async function loginAction(formData: FormData) {
  'use server';

  const expected = getAdminToken();
  const input = String(formData.get('token') ?? '').trim();

  if (!expected || !input || input !== expected) {
    redirect('/admin/videos?error=invalid-token');
  }

  cookies().set(ADMIN_COOKIE_NAME, input, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });

  redirect('/admin/videos');
}

async function logoutAction() {
  'use server';
  cookies().delete(ADMIN_COOKIE_NAME);
}

async function saveVideoAction(formData: FormData) {
  'use server';

  if (!isAuthorized()) return;

  const courseId = String(formData.get('courseId') ?? '').trim();
  const videoUrl = String(formData.get('videoUrl') ?? '').trim();
  const intent = String(formData.get('intent') ?? 'save');

  if (!courseId) return;

  try {
    if (intent === 'clear' || !videoUrl) {
      await deleteVideoOverride(courseId);
    } else {
      await upsertVideoOverride(courseId, videoUrl);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('PGRST205') || message.includes('course_video_overrides')) {
      redirect('/admin/videos?error=missing-table');
    }
    redirect('/admin/videos?error=save-failed');
  }

  revalidatePath('/admin/videos');
  revalidatePath(`/courses/${courseId}`);
  redirect('/admin/videos?saved=1');
}

export const dynamic = 'force-dynamic';

type AdminVideosPageProps = {
  searchParams?: {
    error?: string;
    saved?: string;
  };
};

export default async function AdminVideosPage({ searchParams }: AdminVideosPageProps) {
  const storeEnabled = isVideoOverrideStoreEnabled();
  const configuredToken = Boolean(getAdminToken());

  if (!storeEnabled) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-tide">视频管理后台</h1>
        <p className="mt-3 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900">
          未检测到 Supabase 配置。请先在环境变量中设置 `SUPABASE_URL` 与 `SUPABASE_SERVICE_ROLE_KEY`，再刷新本页。
        </p>
      </div>
    );
  }

  if (!configuredToken) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-tide">视频管理后台</h1>
        <p className="mt-3 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900">
          未设置 `COURSE_ADMIN_TOKEN`，后台已禁用。请先配置后台口令环境变量。
        </p>
      </div>
    );
  }

  const authed = isAuthorized();

  if (!authed) {
    return (
      <div className="mx-auto w-full max-w-md px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-tide">视频管理后台登录</h1>
        <p className="mt-3 text-sm text-ink/70">输入后台口令后，即可在网页里设置每节课的 B 站视频链接。</p>
        {searchParams?.error === 'invalid-token' ? (
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
      </div>
    );
  }

  const courses = getAllCourses();
  const overrides = await listVideoOverrides();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-tide">视频管理后台</h1>
          <p className="mt-2 text-sm text-ink/70">只改数据库里的视频链接，不改课程 MDX 内容文件。</p>
          {searchParams?.saved === '1' ? <p className="mt-2 text-sm text-emerald-700">已保存。</p> : null}
          {searchParams?.error === 'missing-table' ? (
            <p className="mt-2 rounded-lg border border-rose-300/70 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              数据表不存在：请先在 Supabase SQL Editor 执行建表语句 `course_video_overrides`。
            </p>
          ) : null}
          {searchParams?.error === 'save-failed' ? (
            <p className="mt-2 rounded-lg border border-rose-300/70 bg-rose-50 px-3 py-2 text-sm text-rose-700">保存失败，请稍后重试。</p>
          ) : null}
        </div>
        <form action={logoutAction}>
          <button type="submit" className="rounded-lg border border-tide/20 bg-white px-4 py-2 text-sm text-ink transition hover:border-accent/40">
            退出登录
          </button>
        </form>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-tide/10 bg-white/90 shadow-card">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-tide/10 bg-paper/60 text-left text-ink/70">
              <th className="px-4 py-3 font-medium">课程</th>
              <th className="px-4 py-3 font-medium">当前生效链接</th>
              <th className="px-4 py-3 font-medium">数据库覆盖链接</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => {
              const overrideUrl = overrides[course.id] ?? '';
              const effectiveUrl = overrideUrl || course.videoUrl;
              const embedPreview = toEmbedVideoUrl(effectiveUrl);
              return (
                <tr key={course.id} className="border-b border-tide/10 align-top last:border-b-0">
                  <td className="px-4 py-4">
                    <p className="font-medium text-ink">{course.title}</p>
                    <p className="mt-1 text-xs text-ink/60">
                      {course.id} / 高{course.grade === '10' ? '一' : '二'} / {mapChapterName(course.chapter)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="max-w-xs break-all text-xs text-ink/75">{effectiveUrl}</p>
                    <p className="mt-1 max-w-xs break-all text-[11px] text-ink/50">{embedPreview || '未解析到可嵌入地址'}</p>
                  </td>
                  <td className="px-4 py-4">
                    <form action={saveVideoAction} className="min-w-[360px]">
                      <input type="hidden" name="courseId" value={course.id} />
                      <input
                        type="text"
                        name="videoUrl"
                        defaultValue={overrideUrl}
                        placeholder="可填 B站链接 / BV号 / av号"
                        className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                      />
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="submit"
                          name="intent"
                          value="save"
                          className="rounded-lg bg-tide px-3 py-1.5 text-xs font-medium text-white transition hover:bg-tide/90"
                        >
                          保存覆盖
                        </button>
                        <button
                          type="submit"
                          name="intent"
                          value="clear"
                          className="rounded-lg border border-tide/20 bg-white px-3 py-1.5 text-xs font-medium text-ink transition hover:border-accent/40"
                        >
                          清空覆盖（回退MDX）
                        </button>
                      </div>
                    </form>
                  </td>
                  <td className="px-4 py-4">
                    <a href={`/courses/${course.id}`} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">
                      打开课程页
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
