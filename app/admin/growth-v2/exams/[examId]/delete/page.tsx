import type { Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { deleteGrowthExamAction } from '@/app/admin/growth-v2/actions';
import { AdminLogoutButton } from '@/components/admin-auth-panels';
import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import { GrowthV2DeleteConfirmCard } from '@/components/growth-v2/delete-confirm-card';
import { getGrowthExamDetailById, isGrowthV2TableMissingError } from '@/lib/growth-v2-store';

type GrowthV2DeleteExamPageProps = {
  params: {
    examId: string;
  };
  searchParams?: {
    error?: string | string[];
  };
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

const examTypeLabels = {
  school: '学校考试',
  internal: '工作室测验',
  other: '其他'
} as const;

export const dynamic = 'force-dynamic';

export default async function GrowthV2DeleteExamPage({ params, searchParams }: GrowthV2DeleteExamPageProps) {
  const error = firstValue(searchParams?.error);
  const pageHref = `/admin/growth-v2/exams/${params.examId}/delete` as Route;
  const gate = renderGrowthV2AdminGate({
    successPath: pageHref,
    searchError: error
  });
  if (gate) return gate;

  let exam = null;

  try {
    exam = await getGrowthExamDetailById(params.examId);
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) {
      return (
        <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-accent">Growth V2</p>
              <h1 className="mt-2 text-3xl font-semibold text-tide">删除考试</h1>
              <p className="mt-2 text-sm text-ink/70">删除确认页已经接到真实数据层，但当前 Supabase 里还没有 `growth_*` 表。</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`/admin/growth-v2/exams/${params.examId}` as Route} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
                返回考试详情
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

  if (!exam) {
    notFound();
  }

  const deleteAction = deleteGrowthExamAction.bind(null, exam.id, exam.name);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">Growth V2</p>
          <h1 className="mt-2 text-3xl font-semibold text-tide">删除考试</h1>
          <p className="mt-2 text-sm text-ink/70">
            {exam.examDate} · {exam.group?.name ?? '--'} · {examTypeLabels[exam.examType]} · {exam.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/admin/growth-v2/exams/${exam.id}` as Route} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
            返回考试详情
          </Link>
          <AdminLogoutButton redirectPath={pageHref} />
        </div>
      </div>

      <div className="mt-5">
        <GrowthV2AdminErrorBanner error={error} />
      </div>

      <div className="mt-6">
        <GrowthV2DeleteConfirmCard
          title="确认删除这场考试"
          description="删除后，这次考试的主表、全部成绩记录和全部薄弱点标签都会一起移除，无法恢复。"
          confirmLabel="考试名称"
          confirmValue={exam.name}
          impactItems={[
            `考试日期：${exam.examDate}`,
            `所属班组：${exam.group?.name ?? '--'}`,
            `考试类型：${examTypeLabels[exam.examType]}`,
            `将删除 ${exam.scores.length} 条成绩记录和对应薄弱点标签`
          ]}
          action={deleteAction}
          cancelHref={`/admin/growth-v2/exams/${exam.id}`}
          submitLabel="确认删除考试"
          errorMessage={
            error === 'delete-confirm' ? `输入内容与考试名称不一致。请完整输入“${exam.name}”后再删除。` : undefined
          }
        />
      </div>
    </div>
  );
}
