import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '成绩追踪系统',
  description: '面向老师的学生成绩追踪系统，持续记录多次考试成绩、排名和趋势变化。'
};

const scenes = ['月考成绩追踪', '期中/期末阶段复盘', '模考成绩波动观察', '联考后班级与年级排名跟踪'];

const outputs = ['总分走势', '各科成绩变化', '班级排名变化', '年级排名变化', '最近一次考试相对上一次的变化结论'];

const steps = ['新建学生', '录入一次考试', '查看趋势与结论', '后续持续追加考试记录'];

const fields = [
  ['学生信息', '姓名、年级、班级、备注'],
  ['考试信息', '考试名称、考试类型、考试日期'],
  ['核心成绩', '总分、总分满分、班排、年排'],
  ['单科成绩', '语文、数学、英语、物理、化学、生物、政治、历史、地理']
];

export default function ScoreTrackerPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-tide/10 bg-white/80 p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Score Tracking System</p>
        <h1 className="mt-3 text-3xl font-semibold text-tide sm:text-4xl">学生成绩追踪系统</h1>
        <p className="mt-4 max-w-3xl text-base text-ink/80">
          这不是只看一次考试结果的分数记录表，而是一套面向老师的持续追踪工具。系统把每次考试的总分、单科分和排名沉淀下来，让你看到学生到底是在进步、波动，还是原地打转。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/admin/score-tracker" className="rounded-xl bg-tide px-5 py-3 text-sm font-medium text-white transition hover:bg-tide/90">
            打开老师后台
          </Link>
          <Link href="/" className="rounded-xl border border-tide/20 px-5 py-3 text-sm font-medium text-tide transition hover:bg-tide/5">
            返回首页
          </Link>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-tide/10 bg-white/80 p-6">
        <h2 className="text-2xl font-semibold text-tide">适用场景</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {scenes.map((item) => (
            <article key={item} className="rounded-xl border border-tide/10 bg-white p-4 text-sm text-ink/80">
              {item}
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-tide/10 bg-white/80 p-6">
        <h2 className="text-2xl font-semibold text-tide">系统能看什么</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {outputs.map((item) => (
            <article key={item} className="rounded-xl border border-tide/10 bg-paper/60 p-4 text-sm text-ink/80">
              {item}
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-tide/10 bg-white/80 p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-tide">老师录入流程</h2>
            <p className="mt-2 text-sm text-ink/75">系统第一版聚焦手动逐次录入，优先把“能持续追踪”这件事跑通。</p>
          </div>
        </div>
        <ol className="mt-5 grid gap-3 md:grid-cols-4">
          {steps.map((item, index) => (
            <li key={item} className="rounded-xl border border-tide/10 bg-white p-4 text-sm text-ink/80">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-tide text-xs text-white">{index + 1}</span>
              {item}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10 rounded-2xl border border-tide/10 bg-white/80 p-6">
        <h2 className="text-2xl font-semibold text-tide">数据字段说明</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-tide/10 text-tide">
                <th className="px-3 py-2 font-semibold">字段类别</th>
                <th className="px-3 py-2 font-semibold">字段内容</th>
              </tr>
            </thead>
            <tbody>
              {fields.map(([name, content]) => (
                <tr key={name} className="border-b border-tide/10 align-top">
                  <td className="px-3 py-3 font-medium text-tide">{name}</td>
                  <td className="px-3 py-3 text-ink/80">{content}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
