import Link from 'next/link';
import { notFound } from 'next/navigation';

import { updateStudentAction } from '@/app/admin/score-tracker/actions';
import { AdminLogoutButton } from '@/components/admin-auth-panels';
import { ScoreTrackerAdminErrorBanner, renderScoreTrackerAdminGate } from '@/components/score-tracker/admin-access';
import { StudentForm } from '@/components/score-tracker/student-form';
import { getStudentById, isScoreTrackerTableMissingError } from '@/lib/score-tracker';

type EditStudentPageProps = {
  params: {
    studentId: string;
  };
  searchParams?: {
    error?: string | string[];
  };
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EditStudentPage({ params, searchParams }: EditStudentPageProps) {
  const error = firstValue(searchParams?.error);
  const gate = renderScoreTrackerAdminGate({
    successPath: `/admin/score-tracker/students/${params.studentId}/edit`,
    searchError: error
  });
  if (gate) return gate;

  let student = null;

  try {
    student = await getStudentById(params.studentId);
  } catch (fetchError) {
    if (isScoreTrackerTableMissingError(fetchError)) {
      return (
        <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-tide">编辑学生</h1>
            </div>
            <AdminLogoutButton redirectPath={`/admin/score-tracker/students/${params.studentId}/edit`} />
          </div>
          <div className="mt-6">
            <ScoreTrackerAdminErrorBanner error="missing-table" />
          </div>
        </div>
      );
    }

    throw fetchError;
  }

  if (!student) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">成绩追踪后台</p>
          <h1 className="mt-2 text-3xl font-semibold text-tide">编辑学生</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/admin/score-tracker/students/${student.id}`} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
            返回详情
          </Link>
          <AdminLogoutButton redirectPath={`/admin/score-tracker/students/${params.studentId}/edit`} />
        </div>
      </div>

      <div className="mt-5">
        <ScoreTrackerAdminErrorBanner error={error} />
      </div>

      <div className="mt-6">
        <StudentForm
          action={updateStudentAction.bind(null, student.id)}
          submitLabel="保存修改"
          cancelHref={`/admin/score-tracker/students/${student.id}`}
          values={{
            name: student.name,
            grade: student.grade,
            className: student.className,
            headTeacher: student.headTeacher,
            isActive: student.isActive,
            notes: student.notes
          }}
        />
      </div>
    </div>
  );
}
