import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { AdminLoginPanel, AdminLogoutButton, AdminSupabaseUnavailablePanel, AdminTokenUnavailablePanel } from '@/components/admin-auth-panels';
import { getAllCourses, getVideoEmbedHint, mapChapterName } from '@/lib/courses';
import { isAdminAuthorized, isAdminTokenConfigured } from '@/lib/admin-auth';
import { deleteVideoOverride, isVideoOverrideStoreEnabled, listVideoOverrides, upsertVideoOverride } from '@/lib/video-overrides';

async function saveVideoAction(formData: FormData) {
  'use server';

  if (!isAdminAuthorized()) return;

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
  const configuredToken = isAdminTokenConfigured();

  if (!storeEnabled) {
    return <AdminSupabaseUnavailablePanel title="视频管理后台" />;
  }

  if (!configuredToken) {
    return <AdminTokenUnavailablePanel title="视频管理后台" />;
  }

  const authed = isAdminAuthorized();

  if (!authed) {
    return (
      <AdminLoginPanel
        title="视频管理后台登录"
        description="输入后台口令后，即可在网页里设置每节课的 B 站视频链接。"
        successPath="/admin/videos"
        error={searchParams?.error}
      />
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
          <p className="mt-2 text-xs text-ink/55">提示中的“已解析”仅表示链接格式可转换成 B 站播放器，不代表该视频一定允许站外嵌入。</p>
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
        <AdminLogoutButton redirectPath="/admin/videos" />
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
              const effectiveHint = getVideoEmbedHint(effectiveUrl);
              const overrideHint = getVideoEmbedHint(overrideUrl);
              const hintClassName =
                effectiveHint.tone === 'emerald'
                  ? 'text-emerald-700'
                  : effectiveHint.tone === 'amber'
                    ? 'text-amber-700'
                    : 'text-ink/50';
              const overrideHintClassName =
                overrideHint.tone === 'emerald'
                  ? 'text-emerald-700'
                  : overrideHint.tone === 'amber'
                    ? 'text-amber-700'
                    : 'text-ink/50';
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
                    <p className={`mt-1 max-w-xs text-[11px] ${hintClassName}`}>{effectiveHint.message}</p>
                    {effectiveHint.embedUrl ? <p className="mt-1 max-w-xs break-all text-[11px] text-ink/50">{effectiveHint.embedUrl}</p> : null}
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
                      <p className={`mt-2 max-w-md text-[11px] ${overrideHintClassName}`}>
                        {overrideUrl ? overrideHint.message : '留空时将回退到 MDX 默认值。'}
                      </p>
                      {overrideHint.embedUrl ? <p className="mt-1 max-w-md break-all text-[11px] text-ink/50">{overrideHint.embedUrl}</p> : null}
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
