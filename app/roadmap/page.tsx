import type { Route } from 'next';
import Link from 'next/link';

import { getAllCourses } from '@/lib/courses';

type PathNode = {
  id: string;
  title: string;
  chapterLabel: string;
  unitList: string[];
  chapterKey?: string;
  query?: string;
  x: number;
  y: number;
};

const pathNodes: PathNode[] = [
  {
    id: 'vector',
    title: '第六章 平面向量及其应用',
    chapterLabel: 'Chapter 6',
    unitList: ['6.1 平面向量的概念', '6.2 平面向量的运算', '6.3 基本定理及坐标表示', '6.4 平面向量的应用'],
    chapterKey: 'vectors',
    query: '向量',
    x: 15,
    y: 24
  },
  {
    id: 'complex',
    title: '第七章 复数',
    chapterLabel: 'Chapter 7',
    unitList: ['7.1 复数的概念', '7.2 复数的四则运算', '7.3 复数的三角表示'],
    chapterKey: 'complex',
    query: '复数',
    x: 39,
    y: 24
  },
  {
    id: 'solid',
    title: '第八章 立体几何初步',
    chapterLabel: 'Chapter 8',
    unitList: ['8.1 基本立体图形', '8.2 立体图形的直观图', '8.3 表面积与体积', '8.4 空间点线面位置关系', '8.5 空间直线、平面的平行', '8.6 空间直线、平面的垂直'],
    chapterKey: 'solid-geometry',
    query: '立体几何',
    x: 63,
    y: 24
  },
  {
    id: 'stats',
    title: '第九章 统计',
    chapterLabel: 'Chapter 9',
    unitList: ['9.1 随机抽样', '9.2 用样本估计总体', '9.3 统计案例'],
    chapterKey: 'statistics',
    query: '统计',
    x: 75,
    y: 60
  },
  {
    id: 'prob',
    title: '第十章 概率',
    chapterLabel: 'Chapter 10',
    unitList: ['10.1 随机事件与概率', '10.2 事件的相互独立性', '10.3 频率与概率'],
    chapterKey: 'probability',
    query: '概率',
    x: 39,
    y: 60
  }
];

const edges: Array<{ from: string; to: string }> = [
  { from: 'vector', to: 'complex' },
  { from: 'complex', to: 'solid' },
  { from: 'solid', to: 'stats' },
  { from: 'stats', to: 'prob' }
];

function getNodeById(id: string) {
  return pathNodes.find((node) => node.id === id);
}

function buildEdgePath(from: PathNode, to: PathNode) {
  const verticalDistance = Math.abs(from.y - to.y);
  if (verticalDistance < 2) {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }

  // Use a soft curve for cross-row transitions to avoid sharp, chaotic long diagonals.
  const controlOffset = Math.max(8, verticalDistance * 0.45);
  return `M ${from.x} ${from.y} C ${from.x} ${from.y + controlOffset}, ${to.x} ${to.y - controlOffset}, ${to.x} ${to.y}`;
}

export default function RoadmapPage() {
  const courses = getAllCourses();
  const chapterCount = courses.reduce<Record<string, number>>((acc, course) => {
    acc[course.chapter] = (acc[course.chapter] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-tide/10 bg-white/80 p-7 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">人教 A 版 · 必修第二册</p>
        <h1 className="mt-2 text-3xl font-semibold text-tide">学习路径图</h1>
        <p className="mt-3 max-w-3xl text-sm text-ink/80">
          路径严格对应教材第六章到第十章：平面向量、复数、立体几何初步、统计、概率。每个节点会显示当前站内课程覆盖度。
        </p>
      </header>

      <section className="mt-8 hidden rounded-3xl border border-tide/10 bg-white/90 p-6 md:block">
        <div className="relative h-[420px] w-full lg:h-[450px]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L6,3 z" fill="#0d3b66" />
              </marker>
            </defs>
            {edges.map((edge) => {
              const from = getNodeById(edge.from);
              const to = getNodeById(edge.to);
              if (!from || !to) return null;

              return (
                <path
                  key={`${edge.from}-${edge.to}`}
                  d={buildEdgePath(from, to)}
                  stroke="#0d3b66"
                  strokeWidth="0.35"
                  strokeOpacity="0.5"
                  fill="none"
                  markerEnd="url(#arrow)"
                />
              );
            })}
          </svg>

          {pathNodes.map((node) => {
            const count = node.chapterKey ? chapterCount[node.chapterKey] ?? 0 : 0;
            const progress = count > 0 ? `已上线 ${count} 节` : '待补充课程';
            const href = (node.chapterKey && count > 0 ? `/courses?chapter=${node.chapterKey}` : `/courses?q=${encodeURIComponent(node.query ?? node.title)}`) as Route;

            return (
              <article
                key={node.id}
                className="absolute w-52 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-tide/15 bg-paper/95 p-4 shadow-sm lg:w-56 xl:w-60"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`
                }}
              >
                <p className="text-xs font-medium text-accent">{node.chapterLabel}</p>
                <h2 className="mt-1 text-base font-semibold text-tide">{node.title}</h2>
                <p className="mt-2 line-clamp-3 text-xs text-ink/75">{node.unitList.join(' · ')}</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="rounded-full bg-tide/10 px-2 py-1 text-tide">{progress}</span>
                  <Link href={href} className="font-medium text-accent hover:underline">
                    查看内容
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-8 grid gap-3 md:hidden">
        {pathNodes.map((node, index) => {
          const count = node.chapterKey ? chapterCount[node.chapterKey] ?? 0 : 0;
          const progress = count > 0 ? `已上线 ${count} 节` : '待补充课程';

          return (
            <article key={node.id} className="rounded-2xl border border-tide/10 bg-white p-4">
              <p className="text-xs font-medium text-accent">
                Step {index + 1} · {node.chapterLabel}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-tide">{node.title}</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/80">
                {node.unitList.map((unit) => (
                  <li key={unit}>{unit}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-tide">{progress}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-8 rounded-2xl border border-dashed border-tide/25 bg-white/80 p-6">
        <h2 className="text-xl font-semibold text-tide">按教材章节推进（建议）</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink/80">
          <li>第六章与第七章以“概念 + 运算”作为主线，优先保证定义理解和基本运算准确率。</li>
          <li>第八章立体几何按“图形认知 → 位置关系 → 平行垂直”递进，不建议跨节跳学。</li>
          <li>第九章统计与第十章概率建议连续学习，便于从数据描述过渡到随机事件模型。</li>
        </ol>
      </section>
    </div>
  );
}
