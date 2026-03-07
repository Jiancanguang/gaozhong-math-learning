import type { Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { updateGrowthExamAction } from '@/app/admin/growth-v2/actions';

import {
  GrowthV2ExamBatchForm,
  type GrowthV2ExamFormGroup,
  type GrowthV2ExamFormInitialEntry,
  type GrowthV2ExamFormInitialValues,
  type GrowthV2ExamFormStudent
} from '@/components/growth-v2/exam-batch-form';
import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import type { GrowthExamDetail, GrowthGroup, GrowthStudentListItem, GrowthTagCatalogItem } from '@/lib/growth-v2-store';
import { firstValue, fmt, fmtPct } from '@/lib/growth-v2-format';
import { getGrowthExamDetailById, isGrowthV2TableMissingError, listGrowthGroups, listGrowthStudents, listGrowthTagCatalog } from '@/lib/growth-v2-store';

type GrowthV2ExamDetailPageProps = {
  params: {
    examId: string;
  };
  searchParams?: {
    error?: string | string[];
    saved?: string | string[];
  };
};

const examTypeLabels = {
  school: '学校考试',
  internal: '工作室测验',
  other: '其他'
} as const;

export const dynamic = 'force-dynamic';

export default async function GrowthV2ExamDetailPage({ params, searchParams }: GrowthV2ExamDetailPageProps) {
  const error = firstValue(searchParams?.error);
  const saved = firstValue(searchParams?.saved) === '1';
  const detailHref = `/admin/growth-v2/exams/${params.examId}`;
  const gate = renderGrowthV2AdminGate({
    successPath: detailHref,
    searchError: error
  });
  if (gate) return gate;

  let groups: GrowthGroup[] = [];
  let students: GrowthStudentListItem[] = [];
  let tagCatalog: GrowthTagCatalogItem[] = [];
  let exam: GrowthExamDetail | null = null;

  try {
    [groups, students, tagCatalog, exam] = await Promise.all([
      listGrowthGroups({ status: 'all' }),
      listGrowthStudents({ status: 'all' }),
      listGrowthTagCatalog(),
      getGrowthExamDetailById(params.examId)
    ]);
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) {
      return (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-accent">Growth V2</p>
              <h1 className="mt-2 text-3xl font-semibold text-ink">考试详情</h1>
              <p className="mt-2 text-sm text-ink/70">考试详情页已经接到真实数据层，但当前 Supabase 里还没有 `growth_*` 表。</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={'/admin/growth-v2/exams' as Route} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
                返回考试列表
              </Link>
            </div>
          </div>
          <div className="mt-5">
            <GrowthV2AdminErrorBanner error="missing-table" />
          </div>
        </>
      );
    }

    throw fetchError;
  }

  if (!exam) {
    notFound();
  }

  const formGroups: GrowthV2ExamFormGroup[] = groups.map((group) => ({
    id: group.id,
    name: group.name,
    gradeLabel: group.gradeLabel
  }));
  const formStudents: GrowthV2ExamFormStudent[] = students.map((student) => ({
    id: student.id,
    name: student.name,
    gradeLabel: student.gradeLabel,
    homeGroupId: student.homeGroupId
  }));
  const initialValues: GrowthV2ExamFormInitialValues = {
    name: exam.name,
    examDate: exam.examDate,
    examType: exam.examType,
    subject: exam.subject,
    totalScore: String(exam.totalScore),
    notes: exam.notes
  };
  const initialEntries: GrowthV2ExamFormInitialEntry[] = exam.scores.map((score) => ({
    studentId: score.studentId,
    score: String(score.score),
    classRank: score.classRank === null ? '' : String(score.classRank),
    gradeRank: score.gradeRank === null ? '' : String(score.gradeRank),
    masteryLevel: score.masteryLevel ?? '',
    tagNames: score.tags.map((tag) => tag.tagName).join('，'),
    note: score.note
  }));
  const scoreValues = exam.scores.map((score) => score.score);
  const scoreRates = exam.scores.map((score) => (exam.totalScore > 0 ? (score.score / exam.totalScore) * 100 : null)).filter((value): value is number => value !== null);
  const updateAction = updateGrowthExamAction.bind(null, exam.id);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">Growth V2</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">{exam.name}</h1>
          <p className="mt-2 text-sm text-ink/70">
            {exam.examDate} · {exam.group?.name ?? '--'} · {examTypeLabels[exam.examType]}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={'/admin/growth-v2/exams' as Route} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
            返回考试列表
          </Link>
          <Link href={`/admin/growth-v2/exams/${exam.id}/delete` as Route} className="rounded-lg border border-[#e05555]/30 px-4 py-2 text-sm font-medium text-[#e05555] transition hover:bg-[#f7dede]">
            删除考试
          </Link>
        </div>
      </div>

      <div className="mt-5">
        <GrowthV2AdminErrorBanner error={error} />
        {error === 'validation' ? (
          <p className="mt-3 rounded-lg border border-[#f0932b]/30 bg-[#f7ead5] px-3 py-2 text-sm text-[#b8720a]">
            请至少填写班组、考试名称、考试日期、类型和满分；数字字段也要保证合法。
          </p>
        ) : null}
        {saved ? <p className="mt-3 rounded-lg border border-[#00b894]/30 bg-[#d4f2ea] px-3 py-2 text-sm text-[#00b894]">考试记录已更新。</p> : null}
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-border-light bg-surface p-5 shadow-card">
          <p className="text-sm text-ink/65">成绩人数</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{exam.scores.length}</p>
        </article>
        <article className="rounded-2xl border border-border-light bg-surface p-5 shadow-card">
          <p className="text-sm text-ink/65">平均分</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{fmt(scoreValues.length ? scoreValues.reduce((sum, value) => sum + value, 0) / scoreValues.length : null)}</p>
        </article>
        <article className="rounded-2xl border border-border-light bg-surface p-5 shadow-card">
          <p className="text-sm text-ink/65">平均得分率</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{fmtPct(scoreRates.length ? scoreRates.reduce((sum, value) => sum + value, 0) / scoreRates.length : null)}</p>
        </article>
        <article className="rounded-2xl border border-border-light bg-surface p-5 shadow-card">
          <p className="text-sm text-ink/65">最高分 / 最低分</p>
          <p className="mt-2 text-3xl font-semibold text-ink">
            {scoreValues.length ? `${fmt(Math.max(...scoreValues))} / ${fmt(Math.min(...scoreValues))}` : '--'}
          </p>
        </article>
      </section>

      <section className="mt-8">
        <GrowthV2ExamBatchForm
          groups={formGroups}
          students={formStudents}
          tagCatalog={tagCatalog}
          action={updateAction}
          title="编辑考试记录"
          description="这里会覆盖这次考试的主表、成绩记录和薄弱点标签。没有分数的学生不会写入这次考试。"
          submitLabel="保存考试修改"
          initialGroupId={exam.groupId}
          initialValues={initialValues}
          initialEntries={initialEntries}
        />
      </section>
    </>
  );
}
