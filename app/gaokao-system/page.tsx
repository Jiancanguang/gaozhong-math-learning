import type { Route } from 'next';
import Link from 'next/link';

const promises = ['可执行：每天知道做什么', '可量化：每天知道做到什么程度', '可复盘：每天知道如何变得更好'];

const layers = [
  {
    title: '认知层',
    text: '长期思维、系统思维、优化思维、成长思维。先解决方向问题，再谈效率。'
  },
  {
    title: '执行层',
    text: '时间分块、专注启动、每日复盘。把“计划”变成“稳定输出”。'
  },
  {
    title: '训练层',
    text: '刷题策略、知识体系、错题升级、遗忘管理。把“会”变成“稳”。'
  },
  {
    title: '冲刺层',
    text: '场景稳定、节奏调控、考前状态管理。减少关键阶段掉链子。'
  }
];

const toolEntries = [
  { title: '时间分块表', href: '/gaokao-system/tools/time-block' as Route },
  { title: '每日复盘表', href: '/gaokao-system/tools/daily-review' as Route },
  { title: '遗忘管理表', href: '/gaokao-system/tools/forgetting-plan' as Route },
  { title: '错题升级卡', href: '/gaokao-system/tools/error-card' as Route }
];

export default function GaokaoSystemHomePage() {
  const frameworkHref = '/gaokao-system/framework' as Route;
  const architectureHref = '/gaokao-system/architecture' as Route;
  const toolsHref = '/gaokao-system/tools' as Route;

  return (
    <div className="space-y-8">
      <section className="gs-card p-6">
        <h2 className="text-2xl font-semibold text-[var(--gs-primary)] sm:text-3xl">高三提分，不靠鸡血，靠系统。</h2>
        <p className="mt-3 max-w-3xl text-sm text-[var(--gs-muted)]">
          把“努力”升级成“可执行、可量化、可复盘”的提分闭环。从今天开始，让每一天都对高考分数负责。
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          {promises.map((item) => (
            <span key={item} className="rounded-full bg-[rgba(15,109,140,0.1)] px-3 py-1 font-medium text-[var(--gs-primary)]">
              {item}
            </span>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={frameworkHref} className="rounded-xl bg-[var(--gs-accent)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90">
            查看系统框架
          </Link>
          <Link href={architectureHref} className="rounded-xl border border-[var(--gs-line)] px-5 py-3 text-sm font-medium text-[var(--gs-primary)] transition hover:bg-[rgba(15,109,140,0.08)]">
            查看信息架构
          </Link>
          <Link href={toolsHref} className="rounded-xl border border-[var(--gs-line)] px-5 py-3 text-sm font-medium text-[var(--gs-primary)] transition hover:bg-[rgba(15,109,140,0.08)]">
            进入工具中心
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {layers.map((layer) => (
          <article key={layer.title} className="gs-card p-5">
            <h3 className="text-lg font-semibold text-[var(--gs-primary)]">{layer.title}</h3>
            <p className="mt-2 text-sm text-[var(--gs-muted)]">{layer.text}</p>
          </article>
        ))}
      </section>

      <section className="gs-card p-6">
        <h3 className="text-xl font-semibold text-[var(--gs-primary)]">四个核心工具</h3>
        <p className="mt-2 text-sm text-[var(--gs-muted)]">直接选一个开始使用，建议从时间分块表和每日复盘表先落地。</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {toolEntries.map((entry) => (
            <Link key={entry.href} href={entry.href} className="rounded-xl border border-[var(--gs-line)] bg-white p-4 text-sm font-medium text-[var(--gs-primary)] transition hover:bg-[rgba(15,109,140,0.08)]">
              {entry.title}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
