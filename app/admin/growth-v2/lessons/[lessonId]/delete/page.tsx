import type { Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { deleteGrowthLessonAction } from '@/app/admin/growth-v2/actions';
import { AdminLogoutButton } from '@/components/admin-auth-panels';
import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import { GrowthV2DeleteConfirmCard } from '@/components/growth-v2/delete-confirm-card';
import { getGrowthLessonDetailById, isGrowthV2TableMissingError } from '@/lib/growth-v2-store';

type GrowthV2DeleteLessonPageProps = {
  params: {
    lessonId: string;
  };
  searchParams?: {
    error?: string | string[];
  };
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export const dynamic = 'force-dynamic';

export default async function GrowthV2DeleteLessonPage({ params, searchParams }: GrowthV2DeleteLessonPageProps) {
  const error = firstValue(searchParams?.error);
  const pageHref = `/admin/growth-v2/lessons/${params.lessonId}/delete` as Route;
  const gate = renderGrowthV2AdminGate({
    successPath: pageHref,
    searchError: error
  });
  if (gate) return gate;

  let lesson = null;

  try {
    lesson = await getGrowthLessonDetailById(params.lessonId);
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) {
      return (
        <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-accent">Growth V2</p>
              <h1 className="mt-2 text-3xl font-semibold text-tide">删除课堂</h1>
              <p className="mt-2 text-sm text-ink/70">删除确认页已经接到真实数据层，但当前 Supabase 里还没有 `growth_*` 表。</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`/admin/growth-v2/lessons/${params.lessonId}` as Route} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
                返回课堂详情
              </Link>
              <AdminLogoutButton redirectPath={pageHref} />
            </div>
          </div>
          <div className="mt-5">
            <GrowthV2AdminErrorBanner error="missing-table" />
          </div>
        </div>
      );
    }

    throw fetchError;
  }

  if (!lesson) {
    notFound();
  }

  const deleteAction = deleteGrowthLessonAction.bind(null, lesson.id, lesson.topic);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">Growth V2</p>
          <h1 className="mt-2 text-3xl font-semibold text-tide">删除课堂</h1>
          <p className="mt-2 text-sm text-ink/70">
            {lesson.lessonDate} · {lesson.group?.name ?? '--'} · {lesson.topic}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/admin/growth-v2/lessons/${lesson.id}` as Route} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
            返回课堂详情
          </Link>
          <AdminLogoutButton redirectPath={pageHref} />
        </div>
      </div>

      <div className="mt-5">
        <GrowthV2AdminErrorBanner error={error} />
      </div>

      <div className="mt-6">
        <GrowthV2DeleteConfirmCard
          title="确认删除这节课"
          description="删除后，这节课的主表和全部学生课堂记录都会一起移除，无法恢复。"
          confirmLabel="课堂主题"
          confirmValue={lesson.topic}
          impactItems={[
            `课堂日期：${lesson.lessonDate}`,
            `所属班组：${lesson.group?.name ?? '--'}`,
            `将删除 ${lesson.records.length} 条学生课堂记录`
          ]}
          action={deleteAction}
          cancelHref={`/admin/growth-v2/lessons/${lesson.id}`}
          submitLabel="确认删除课堂"
          errorMessage={
            error === 'delete-confirm' ? `输入内容与课堂主题不一致。请完整输入“${lesson.topic}”后再删除。` : undefined
          }
        />
      </div>
    </div>
  );
}
