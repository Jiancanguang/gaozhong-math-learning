import Link from 'next/link';

import { AdminLogoutButton } from '@/components/admin-auth-panels';
import { ScoreTrackerAdminErrorBanner, renderScoreTrackerAdminGate } from '@/components/score-tracker/admin-access';
import { getTrendMeta } from '@/lib/score-tracker-display';
import { isGrade, isScoreTrackerTableMissingError, listStudents } from '@/lib/score-tracker';

type ScoreTrackerAdminPageProps = {
  searchParams?: {
    q?: string | string[];
    grade?: string | string[];
    className?: string | string[];
    headTeacher?: string | string[];
    isActive?: string | string[];
    error?: string | string[];
  };
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ScoreTrackerAdminPage({ searchParams }: ScoreTrackerAdminPageProps) {
  const q = firstValue(searchParams?.q)?.trim() ?? '';
  const gradeValue = firstValue(searchParams?.grade)?.trim() ?? '';
  const className = firstValue(searchParams?.className)?.trim() ?? '';
  const headTeacher = firstValue(searchParams?.headTeacher)?.trim() ?? '';
  const isActiveValue = firstValue(searchParams?.isActive)?.trim() ?? 'all';
  const error = firstValue(searchParams?.error);
  const grade = isGrade(gradeValue) ? gradeValue : '';
  const isActive = isActiveValue === 'active' || isActiveValue === 'inactive' ? isActiveValue : 'all';

  const gate = renderScoreTrackerAdminGate({
    successPath: '/admin/score-tracker',
    searchError: error
  });
  if (gate) return gate;

  let students = [];
  let classOptions: string[] = [];
  let headTeacherOptions: string[] = [];

  try {
    const [studentRows, sourceRows] = await Promise.all([
      listStudents({ q, grade, className, headTeacher, isActive }),
      listStudents({ grade, isActive })
    ]);
    students = studentRows;
    classOptions = Array.from(new Set(sourceRows.map((student) => student.className))).sort((left, right) => left.localeCompare(right, 'zh-CN'));
    headTeacherOptions = Array.from(new Set(sourceRows.map((student) => student.headTeacher).filter(Boolean))).sort((left, right) =>
      left.localeCompare(right, 'zh-CN')
    );
  } catch (fetchError) {
    if (isScoreTrackerTableMissingError(fetchError)) {
      return (
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-tide">成绩追踪后台</h1>
              <p className="mt-2 text-sm text-ink/70">管理学生名单、成绩台账和趋势变化。</p>
            </div>
            <AdminLogoutButton redirectPath="/admin/score-tracker" />
          </div>
          <div className="mt-6">
            <ScoreTrackerAdminErrorBanner error="missing-table" />
          </div>
        </div>
      );
    }

    throw fetchError;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-tide">成绩追踪后台</h1>
          <p className="mt-2 text-sm text-ink/70">按学生持续记录考试成绩、班排和年排变化。</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/score-tracker/students/new" className="rounded-lg bg-tide px-4 py-2 text-sm font-medium text-white transition hover:bg-tide/90">
            新建学生
          </Link>
          <AdminLogoutButton redirectPath="/admin/score-tracker" />
        </div>
      </div>

      <div className="mt-5">
        <ScoreTrackerAdminErrorBanner error={error} />
      </div>

      <form className="mt-6 grid gap-3 rounded-2xl border border-tide/10 bg-white/85 p-4 md:grid-cols-[1.3fr_160px_180px_180px_160px_auto]">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="按学生姓名搜索"
          className="rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <select name="grade" defaultValue={grade} className="rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent">
          <option value="">全部年级</option>
          <option value="10">高一</option>
          <option value="11">高二</option>
          <option value="12">高三</option>
        </select>
        <select
          name="className"
          defaultValue={className}
          className="rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">全部班级</option>
          {classOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          name="headTeacher"
          defaultValue={headTeacher}
          className="rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">全部班主任</option>
          {headTeacherOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          name="isActive"
          defaultValue={isActive}
          className="rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="all">全部状态</option>
          <option value="active">在读</option>
          <option value="inactive">已结课/不在读</option>
        </select>
        <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90">
          筛选
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-tide/10 bg-white/90 shadow-card">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-tide/10 bg-paper/60 text-left text-ink/70">
              <th className="px-4 py-3 font-medium">学生姓名</th>
              <th className="px-4 py-3 font-medium">年级</th>
              <th className="px-4 py-3 font-medium">班级</th>
              <th className="px-4 py-3 font-medium">班主任</th>
              <th className="px-4 py-3 font-medium">是否在读</th>
              <th className="px-4 py-3 font-medium">最近一次考试</th>
              <th className="px-4 py-3 font-medium">最近一次总分</th>
              <th className="px-4 py-3 font-medium">最近一次班排</th>
              <th className="px-4 py-3 font-medium">最近一次年排</th>
              <th className="px-4 py-3 font-medium">考试次数</th>
              <th className="px-4 py-3 font-medium">最近趋势</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((student) => {
                const trend = getTrendMeta(student.latestTrend);
                return (
                  <tr key={student.id} className="border-b border-tide/10 align-top last:border-b-0">
                    <td className="px-4 py-4">
                      <Link href={`/admin/score-tracker/students/${student.id}`} className="font-medium text-tide hover:text-accent">
                        {student.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-ink/80">高{student.grade === '10' ? '一' : student.grade === '11' ? '二' : '三'}</td>
                    <td className="px-4 py-4 text-ink/80">{student.className}</td>
                    <td className="px-4 py-4 text-ink/80">{student.headTeacher || '--'}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          student.isActive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
                        }`}
                      >
                        {student.isActive ? '在读' : '不在读'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-ink/80">{student.latestExam ? `${student.latestExam.examDate} · ${student.latestExam.examName}` : '--'}</td>
                    <td className="px-4 py-4 text-ink/80">{student.latestExam ? student.latestExam.totalScore : '--'}</td>
                    <td className="px-4 py-4 text-ink/80">{student.latestExam?.classRank ?? '--'}</td>
                    <td className="px-4 py-4 text-ink/80">{student.latestExam?.gradeRank ?? '--'}</td>
                    <td className="px-4 py-4 text-ink/80">{student.examCount}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${trend.className}`}>{trend.label}</span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-sm text-ink/60">
                  还没有学生记录，先新建一个学生。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
