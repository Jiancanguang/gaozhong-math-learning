import { createGrowthLessonAction } from '@/app/admin/growth-v2/actions';
import { GrowthV2LessonBatchForm, type GrowthV2LessonFormGroup, type GrowthV2LessonFormStudent } from '@/components/growth-v2/lesson-batch-form';
import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import { firstValue } from '@/lib/growth-v2-format';
import type { GrowthGroup, GrowthStudentListItem } from '@/lib/growth-v2-store';
import { isGrowthV2TableMissingError, listGrowthGroups, listGrowthStudents } from '@/lib/growth-v2-store';

type PageProps = {
  searchParams?: { error?: string | string[] };
};

export const dynamic = 'force-dynamic';

export default async function NewLessonPage({ searchParams }: PageProps) {
  const error = firstValue(searchParams?.error);

  const gate = renderGrowthV2AdminGate({ successPath: '/admin/growth-v2/lessons/new', searchError: error });
  if (gate) return gate;

  let groups: GrowthGroup[] = [];
  let students: GrowthStudentListItem[] = [];

  try {
    [groups, students] = await Promise.all([
      listGrowthGroups({ status: 'active' }),
      listGrowthStudents({ status: 'active' })
    ]);
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) return <GrowthV2AdminErrorBanner error="missing-table" />;
    throw fetchError;
  }

  const activeGroups: GrowthV2LessonFormGroup[] = groups.map((g) => ({ id: g.id, name: g.name, gradeLabel: g.gradeLabel }));
  const activeStudents: GrowthV2LessonFormStudent[] = students.map((s) => ({ id: s.id, name: s.name, gradeLabel: s.gradeLabel, homeGroupId: s.homeGroupId, homeGroupName: s.homeGroup?.name ?? null }));

  return (
    <>
      <GrowthV2AdminErrorBanner error={error} />
      {error === 'validation' ? <p className="mb-3 rounded-lg border border-stat-amber/30 bg-stat-amber-soft px-3 py-2 text-sm text-stat-amber">请至少填写班组、上课日期和课堂主题。</p> : null}

      <h1 className="text-2xl font-bold text-ink">新建课堂记录</h1>
      <p className="mt-2 text-sm text-text-light">班组、主题、时间、测验和逐个学生表现可以一次录完。当前可选学生 {activeStudents.length} 人。</p>

      <div className="mt-6">
        <GrowthV2LessonBatchForm groups={activeGroups} students={activeStudents} action={createGrowthLessonAction} />
      </div>
    </>
  );
}
