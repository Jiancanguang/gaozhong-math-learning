import type { Metadata } from 'next';
import Link from 'next/link';
import { getDashboardStats, listLessons } from '@/lib/growth-tracker';

export const metadata: Metadata = {
  title: '总览 — 筑学工作室'
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const recentLessons = (await listLessons()).slice(0, 8);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gt-primary">数据总览</h1>
        <Link
          href={'/record' as never}
          className="rounded-xl bg-gt-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-gt-accent/90"
        >
          录入新课堂
        </Link>
      </div>

      {/* Stats cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="在读学生" value={`${stats.totalStudents}`} />
        <StatCard label="累计课程" value={`${stats.totalLessons}`} />
        <StatCard label="进门考均分" value={stats.avgEntryScore != null ? `${stats.avgEntryScore}` : '--'} />
        <StatCard label="出门考均分" value={stats.avgExitScore != null ? `${stats.avgExitScore}` : '--'} />
      </div>

      {/* Entry vs Exit comparison */}
      {stats.avgEntryScore != null && stats.avgExitScore != null ? (
        <div className="mt-6 rounded-2xl border border-gt-primary/10 bg-white/80 p-5">
          <h2 className="text-base font-semibold text-gt-primary">进出门考对比</h2>
          <div className="mt-3 flex items-end gap-6">
            <div className="flex-1">
              <p className="text-xs text-ink/50">进门考均分</p>
              <div className="mt-1 h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-sky"
                  style={{ width: `${(stats.avgEntryScore / 10) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-sm font-medium text-gt-primary">{stats.avgEntryScore}/10</p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-ink/50">出门考均分</p>
              <div className="mt-1 h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-gt-green"
                  style={{ width: `${(stats.avgExitScore / 10) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-sm font-medium text-gt-primary">{stats.avgExitScore}/10</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-ink/50">提升</p>
              <p className="mt-1 text-lg font-semibold text-gt-green">
                +{(stats.avgExitScore - stats.avgEntryScore).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Recent lessons */}
      <h2 className="mt-8 text-lg font-semibold text-gt-primary">最近课程</h2>
      {recentLessons.length === 0 ? (
        <p className="mt-3 rounded-xl border border-gt-primary/10 bg-white/80 p-6 text-center text-sm text-ink/50">
          暂无课程记录，
          <Link href={'/record' as never} className="text-gt-accent hover:underline">去录入第一节课</Link>
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {recentLessons.map((lesson) => (
            <div key={lesson.id} className="flex items-center justify-between rounded-xl border border-gt-primary/10 bg-white/80 p-4">
              <div>
                <span className="text-sm font-medium text-gt-primary">{lesson.topic || '未命名'}</span>
                <span className="ml-3 text-xs text-ink/50">{lesson.date}</span>
              </div>
              <span className="rounded-full bg-gt-primary/5 px-2.5 py-0.5 text-xs text-gt-primary">{lesson.groupName}</span>
            </div>
          ))}
        </div>
      )}

      {recentLessons.length > 0 ? (
        <div className="mt-3 text-right">
          <Link href={'/history' as never} className="text-sm text-gt-accent hover:underline">
            查看全部 →
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gt-primary/10 bg-white/80 p-4 text-center">
      <p className="text-xs text-ink/50">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gt-primary">{value}</p>
    </div>
  );
}
