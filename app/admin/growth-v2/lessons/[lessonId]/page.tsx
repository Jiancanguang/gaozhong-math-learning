import type { Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { updateGrowthLessonAction } from '@/app/admin/growth-v2/actions';

import {
  GrowthV2LessonBatchForm,
  type GrowthV2LessonFormGroup,
  type GrowthV2LessonFormInitialEntry,
  type GrowthV2LessonFormInitialValues,
  type GrowthV2LessonFormStudent
} from '@/components/growth-v2/lesson-batch-form';
import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import type { GrowthGroup, GrowthLessonDetail, GrowthStudentListItem } from '@/lib/growth-v2-store';
import { getGrowthLessonDetailById, isGrowthV2TableMissingError, listGrowthGroups, listGrowthStudents } from '@/lib/growth-v2-store';
import { firstValue } from '@/lib/growth-v2-format';

type GrowthV2LessonDetailPageProps = {
  params: {
    lessonId: string;
  };
  searchParams?: {
    error?: string | string[];
    saved?: string | string[];
  };
};

function formatNumber(value: number | null, digits = 1) {
  return value === null ? '--' : value.toFixed(digits);
}

function formatPercent(value: number | null) {
  return value === null ? '--' : `${value.toFixed(1)}%`;
}

export const dynamic = 'force-dynamic';

export default async function GrowthV2LessonDetailPage({ params, searchParams }: GrowthV2LessonDetailPageProps) {
  const error = firstValue(searchParams?.error);
  const saved = firstValue(searchParams?.saved) === '1';
  const detailHref = `/admin/growth-v2/lessons/${params.lessonId}`;
  const gate = renderGrowthV2AdminGate({
    successPath: detailHref,
    searchError: error
  });
  if (gate) return gate;

  let groups: GrowthGroup[] = [];
  let students: GrowthStudentListItem[] = [];
  let lesson: GrowthLessonDetail | null = null;

  try {
    [groups, students, lesson] = await Promise.all([
      listGrowthGroups({ status: 'all' }),
      listGrowthStudents({ status: 'all' }),
      getGrowthLessonDetailById(params.lessonId)
    ]);
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) {
      return (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-accent">Growth V2</p>
              <h1 className="mt-2 text-3xl font-semibold text-ink">课堂详情</h1>
              <p className="mt-2 text-sm text-ink/70">课堂详情页已经接到真实数据层，但当前 Supabase 里还没有 `growth_*` 表。</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={'/admin/growth-v2/lessons' as Route} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
                返回课堂列表
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

  if (!lesson) {
    notFound();
  }

  const formGroups: GrowthV2LessonFormGroup[] = groups.map((group) => ({
    id: group.id,
    name: group.name,
    gradeLabel: group.gradeLabel
  }));
  const formStudents: GrowthV2LessonFormStudent[] = students.map((student) => ({
    id: student.id,
    name: student.name,
    gradeLabel: student.gradeLabel,
    homeGroupId: student.homeGroupId,
    homeGroupName: student.homeGroup?.name ?? null
  }));
  const initialValues: GrowthV2LessonFormInitialValues = {
    lessonDate: lesson.lessonDate,
    timeStart: lesson.timeStart ?? '',
    timeEnd: lesson.timeEnd ?? '',
    topic: lesson.topic,
    entryTestTopic: lesson.entryTestTopic,
    exitTestTopic: lesson.exitTestTopic,
    testTotal: lesson.testTotal === null ? '' : String(lesson.testTotal),
    homework: lesson.homework,
    keyPoints: lesson.keyPoints,
    notes: lesson.notes
  };
  const initialEntries: GrowthV2LessonFormInitialEntry[] = lesson.records.map((record) => ({
    studentId: record.studentId,
    isGuest: record.isGuest,
    entryScore: record.entryScore === null ? '' : String(record.entryScore),
    exitScore: record.exitScore === null ? '' : String(record.exitScore),
    performance: record.performance === null ? '' : String(record.performance),
    masteryLevel: record.masteryLevel ?? '',
    comment: record.comment
  }));
  const totalRecords = lesson.records.length;
  const guestCount = lesson.records.filter((record) => record.isGuest).length;
  const exitRates = lesson.records.flatMap((record) => {
    if (record.exitScore === null || lesson.testTotal === null || lesson.testTotal <= 0) return [];
    return [(record.exitScore / lesson.testTotal) * 100];
  });
  const performanceValues = lesson.records.flatMap((record) => (record.performance === null ? [] : [record.performance]));
  const updateAction = updateGrowthLessonAction.bind(null, lesson.id);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">Growth V2</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">{lesson.topic}</h1>
          <p className="mt-2 text-sm text-ink/70">
            {lesson.lessonDate} · {lesson.group?.name ?? '--'} · 记录数 {lesson.records.length}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={'/admin/growth-v2/lessons' as Route} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
            返回课堂列表
          </Link>
          <Link href={`/admin/growth-v2/lessons/${lesson.id}/delete` as Route} className="rounded-lg border border-[#e05555]/30 px-4 py-2 text-sm font-medium text-[#e05555] transition hover:bg-[#f7dede]">
            删除课堂
          </Link>
        </div>
      </div>

      <div className="mt-5">
        <GrowthV2AdminErrorBanner error={error} />
        {error === 'validation' ? (
          <p className="mt-3 rounded-lg border border-[#f0932b]/30 bg-[#f7ead5] px-3 py-2 text-sm text-[#b8720a]">
            请至少填写班组、上课日期和课堂主题；数字字段也要保证是合法数值。
          </p>
        ) : null}
        {saved ? <p className="mt-3 rounded-lg border border-[#00b894]/30 bg-[#d4f2ea] px-3 py-2 text-sm text-[#00b894]">课堂记录已更新。</p> : null}
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-border-light bg-surface p-5 shadow-card">
          <p className="text-sm text-ink/65">记录人数</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{totalRecords}</p>
        </article>
        <article className="rounded-2xl border border-border-light bg-surface p-5 shadow-card">
          <p className="text-sm text-ink/65">调课人数</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{guestCount}</p>
        </article>
        <article className="rounded-2xl border border-border-light bg-surface p-5 shadow-card">
          <p className="text-sm text-ink/65">平均课后得分率</p>
          <p className="mt-2 text-3xl font-semibold text-ink">
            {formatPercent(exitRates.length ? exitRates.reduce((sum, value) => sum + value, 0) / exitRates.length : null)}
          </p>
        </article>
        <article className="rounded-2xl border border-border-light bg-surface p-5 shadow-card">
          <p className="text-sm text-ink/65">平均课堂表现</p>
          <p className="mt-2 text-3xl font-semibold text-ink">
            {formatNumber(performanceValues.length ? performanceValues.reduce((sum, value) => sum + value, 0) / performanceValues.length : null)}
          </p>
        </article>
      </section>

      <section className="mt-8">
        <GrowthV2LessonBatchForm
          groups={formGroups}
          students={formStudents}
          action={updateAction}
          title="编辑课堂记录"
          description="这里会覆盖这节课当前的课堂主表和学生记录。保持留空的学生不会写入这节课。"
          submitLabel="保存课堂修改"
          initialGroupId={lesson.groupId}
          initialValues={initialValues}
          initialEntries={initialEntries}
        />
      </section>
    </>
  );
}
