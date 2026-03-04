import type { Metadata } from 'next';
import { listStudents, type Grade } from '@/lib/score-tracker';
import { getDistinctGroupNames } from '@/lib/growth-tracker';
import { BatchRecordForm } from '@/components/growth-tracker/batch-record-form';
import { saveBatchRecordAction } from '@/app/(growth-tracker)/record/actions';

export const metadata: Metadata = {
  title: '课堂录入 — 筑学工作室'
};

type Props = {
  searchParams: { error?: string; success?: string };
};

export default async function RecordPage({ searchParams }: Props) {
  const groupNames = await getDistinctGroupNames();
  const allStudents = await listStudents({ isActive: 'active' });

  // Group students by group_name
  const studentsByGroup: Record<string, { id: string; name: string; grade: Grade }[]> = {};
  for (const student of allStudents) {
    if (!student.groupName) continue;
    if (!studentsByGroup[student.groupName]) {
      studentsByGroup[student.groupName] = [];
    }
    studentsByGroup[student.groupName].push({
      id: student.id,
      name: student.name,
      grade: student.grade
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gt-primary">课堂记录录入</h1>
      <p className="mt-1 text-sm text-ink/60">选择班组后，为每位学生录入本节课的进出门考成绩、课堂表现和掌握度。</p>

      {searchParams.error === 'validation' ? (
        <p className="mt-4 rounded-lg border border-rose-300/70 bg-rose-50 px-3 py-2 text-sm text-rose-700">请填写班组、日期和课程主题。</p>
      ) : searchParams.error === 'save-failed' ? (
        <p className="mt-4 rounded-lg border border-rose-300/70 bg-rose-50 px-3 py-2 text-sm text-rose-700">保存失败，请重试。</p>
      ) : null}

      <div className="mt-6">
        <BatchRecordForm
          groupNames={groupNames}
          studentsByGroup={studentsByGroup}
          action={saveBatchRecordAction}
        />
      </div>
    </div>
  );
}
