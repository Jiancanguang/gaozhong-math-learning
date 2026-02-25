import type { Route } from 'next';
import Link from 'next/link';

const examEntries: Array<{ label: string; href: Route; count: string }> = [
  { label: '2025 真题', href: '/courses?q=高考' as Route, count: '持续整理中' },
  { label: '2024 真题', href: '/courses?q=导数' as Route, count: '优先补齐压轴题' },
  { label: '2023 真题', href: '/courses?q=圆锥曲线' as Route, count: '优先补齐解析几何' }
];

const topicSeries: Array<{ title: string; href: Route; desc: string }> = [
  { title: '导数压轴', href: '/courses?q=导数' as Route, desc: '单调性、极值、参数讨论、构造函数' },
  { title: '圆锥曲线', href: '/courses?q=解析几何' as Route, desc: '轨迹、弦中点、定值与最值模型' },
  { title: '立体几何', href: '/courses?q=立体几何' as Route, desc: '线面关系、空间向量与证明题模板' },
  { title: '概率统计', href: '/courses?q=概率' as Route, desc: '分布模型、条件概率与统计推断' }
];

export default function GaokaoPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-tide/10 bg-white/80 p-7 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Gaokao Math Hub</p>
        <h1 className="mt-2 text-3xl font-semibold text-tide">高三高考真题讲解</h1>
        <p className="mt-3 max-w-3xl text-sm text-ink/80">
          按“年份 + 卷别 + 题型”组织真题内容。每道题固定输出：思路框架、规范解法、易错点、同类迁移题。
        </p>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {examEntries.map((entry) => (
          <article key={entry.label} className="rounded-2xl border border-tide/10 bg-white/85 p-5">
            <h2 className="text-xl font-semibold text-tide">{entry.label}</h2>
            <p className="mt-2 text-sm text-ink/75">{entry.count}</p>
            <Link href={entry.href} className="mt-4 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90">
              查看题目
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-tide">专题串讲</h2>
          <Link href="/courses" className="text-sm font-medium text-accent hover:underline">
            全部内容
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {topicSeries.map((topic) => (
            <article key={topic.title} className="rounded-2xl border border-tide/10 bg-white p-5">
              <h3 className="text-lg font-semibold text-tide">{topic.title}</h3>
              <p className="mt-2 text-sm text-ink/75">{topic.desc}</p>
              <Link href={topic.href} className="mt-4 inline-flex text-sm font-medium text-accent hover:underline">
                进入专题
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-dashed border-tide/25 bg-white/80 p-6">
        <h2 className="text-xl font-semibold text-tide">更新规则</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink/80">
          <li>每周至少更新 1 套真题或 1 个专题题组。</li>
          <li>优先更新高频失分模块：导数、圆锥曲线、立体几何。</li>
          <li>每次更新都包含可复盘的讲义要点和同类题建议。</li>
        </ol>
      </section>
    </div>
  );
}
