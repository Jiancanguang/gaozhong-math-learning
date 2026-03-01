import Link from 'next/link';

import { AdminLogoutButton } from '@/components/admin-auth-panels';
import { ScoreTrackerAdminErrorBanner, renderScoreTrackerAdminGate } from '@/components/score-tracker/admin-access';
import { StudentForm } from '@/components/score-tracker/student-form';
import { createStudentAction } from '@/app/admin/score-tracker/actions';

type NewStudentPageProps = {
  searchParams?: {
    error?: string | string[];
  };
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function NewStudentPage({ searchParams }: NewStudentPageProps) {
  const error = firstValue(searchParams?.error);
  const gate = renderScoreTrackerAdminGate({
    successPath: '/admin/score-tracker/students/new',
    searchError: error
  });
  if (gate) return gate;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">成绩追踪后台</p>
          <h1 className="mt-2 text-3xl font-semibold text-tide">新建学生</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/score-tracker" className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
            返回列表
          </Link>
          <AdminLogoutButton redirectPath="/admin/score-tracker/students/new" />
        </div>
      </div>

      <div className="mt-5">
        <ScoreTrackerAdminErrorBanner error={error} />
      </div>

      <div className="mt-6">
        <StudentForm action={createStudentAction} submitLabel="保存学生信息" cancelHref="/admin/score-tracker" />
      </div>
    </div>
  );
}
