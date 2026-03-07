import { createGrowthExamAction } from '@/app/admin/growth-v2/actions';
import { GrowthV2ExamBatchForm, type GrowthV2ExamFormGroup, type GrowthV2ExamFormStudent } from '@/components/growth-v2/exam-batch-form';
import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import { firstValue } from '@/lib/growth-v2-format';
import type { GrowthGroup, GrowthStudentListItem, GrowthTagCatalogItem } from '@/lib/growth-v2-store';
import { isGrowthV2TableMissingError, listGrowthGroups, listGrowthStudents, listGrowthTagCatalog } from '@/lib/growth-v2-store';

type PageProps = {
  searchParams?: { error?: string | string[] };
};

export const dynamic = 'force-dynamic';

export default async function NewExamPage({ searchParams }: PageProps) {
  const error = firstValue(searchParams?.error);

  const gate = renderGrowthV2AdminGate({ successPath: '/admin/growth-v2/exams/new', searchError: error });
  if (gate) return gate;

  let groups: GrowthGroup[] = [];
  let students: GrowthStudentListItem[] = [];
  let tagCatalog: GrowthTagCatalogItem[] = [];

  try {
    [groups, students, tagCatalog] = await Promise.all([
      listGrowthGroups({ status: 'active' }),
      listGrowthStudents({ status: 'active' }),
      listGrowthTagCatalog()
    ]);
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) return <GrowthV2AdminErrorBanner error="missing-table" />;
    throw fetchError;
  }

  const activeGroups: GrowthV2ExamFormGroup[] = groups.map((g) => ({ id: g.id, name: g.name, gradeLabel: g.gradeLabel }));
  const activeStudents: GrowthV2ExamFormStudent[] = students.map((s) => ({ id: s.id, name: s.name, gradeLabel: s.gradeLabel, homeGroupId: s.homeGroupId }));

  return (
    <>
      <GrowthV2AdminErrorBanner error={error} />
      {error === 'validation' ? <p className="mb-3 rounded-lg border border-stat-amber/30 bg-stat-amber-soft px-3 py-2 text-sm text-stat-amber">请至少填写班组、考试名称、日期、类型和满分。</p> : null}

      <h1 className="text-2xl font-bold text-ink">新建考试记录</h1>
      <p className="mt-2 text-sm text-text-light">当前可选学生 {activeStudents.length} 人，已启用标签 {tagCatalog.length} 个。</p>

      <div className="mt-6">
        <GrowthV2ExamBatchForm groups={activeGroups} students={activeStudents} tagCatalog={tagCatalog} action={createGrowthExamAction} />
      </div>
    </>
  );
}
