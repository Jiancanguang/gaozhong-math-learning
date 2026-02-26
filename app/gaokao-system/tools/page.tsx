import type { Route } from 'next';
import Link from 'next/link';

const tools = [
  {
    title: '时间分块表',
    href: '/gaokao-system/tools/time-block' as Route,
    desc: '先定时间再定任务，避免任务挤占造成失控。'
  },
  {
    title: '每日复盘表',
    href: '/gaokao-system/tools/daily-review' as Route,
    desc: '每天 10 分钟，把问题转成次日可执行动作。'
  },
  {
    title: '遗忘管理表',
    href: '/gaokao-system/tools/forgetting-plan' as Route,
    desc: '按 1/2/4/7/14/21/30 天节奏复习高价值内容。'
  },
  {
    title: '错题升级卡',
    href: '/gaokao-system/tools/error-card' as Route,
    desc: '错题分级推进，稳定正确后归档。'
  }
];

export default function ToolsPage() {
  return (
    <section className="gs-card p-6">
      <h2 className="text-2xl font-semibold text-[var(--gs-primary)]">工具中心</h2>
      <p className="mt-2 text-sm text-[var(--gs-muted)]">每个工具都包含适用场景、使用步骤和表格字段，可直接复制到 Notion/飞书表格/Excel。</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {tools.map((tool) => (
          <article key={tool.href} className="rounded-2xl border border-[var(--gs-line)] bg-white p-5">
            <h3 className="text-lg font-semibold text-[var(--gs-primary)]">{tool.title}</h3>
            <p className="mt-2 text-sm text-[var(--gs-muted)]">{tool.desc}</p>
            <Link href={tool.href} className="mt-4 inline-flex rounded-lg bg-[var(--gs-accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
              打开工具页
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
