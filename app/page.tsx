import type { Route } from 'next';
import Link from 'next/link';

import { CourseCard } from '@/components/course-card';
import { getLatestCourses, mapChapterName } from '@/lib/courses';

const focusTracks = [
  {
    title: '高一下同步课程',
    description: '按学校进度讲透每周重点，覆盖函数、数列、三角与解析几何核心题型。',
    timeline: '每周更新 2-3 节',
    href: '/courses?grade=10' as Route
  },
  {
    title: '高三高考真题讲解',
    description: '以近年真题为线索，拆解压轴题思路、评分点与时间分配策略。',
    timeline: '本阶段优先推进',
    href: '/roadmap' as Route
  }
];

const profileHighlights = [
  '个人教学站点，目标是把复杂知识点讲清、讲短、讲会',
  '所有课程围绕“看得懂 + 做得出 + 能复盘”三件事设计',
  '先完成主页与课程框架，再持续补齐高三真题专题'
];

const nextMilestones = [
  '完成首页个人化改版与导航整理',
  '上线高一下同步课第一批章节（函数/数列/三角）',
  '搭建高三真题讲解专区并持续更新套卷解析'
];

export default function HomePage() {
  const assignmentHref = '/assignment' as Route;
  const latestCourses = getLatestCourses(6);
  const latestChapters = Array.from(new Set(latestCourses.map((course) => course.chapter))).map((chapter) => mapChapterName(chapter));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-tide/10 bg-white/80 p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Personal Teaching Hub</p>
        <h1 className="mt-3 text-3xl font-semibold text-tide sm:text-4xl">高中数学个人主页</h1>
        <p className="mt-4 max-w-2xl text-base text-ink/80">
          这里是我的教学主站。当前重点先做两件事：高一下同步课程系统化上线，以及高三高考真题讲解持续更新。
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          {profileHighlights.map((item) => (
            <span key={item} className="rounded-full bg-tide/10 px-3 py-1 font-medium text-tide">
              {item}
            </span>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/courses?grade=10" className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accent/90">
            进入高一下课程
          </Link>
          <Link href="/roadmap" className="rounded-xl bg-tide px-5 py-3 text-sm font-medium text-white transition hover:bg-tide/90">
            查看高三真题规划
          </Link>
          <Link href={assignmentHref} className="rounded-xl border border-tide/20 px-5 py-3 text-sm font-medium text-tide transition hover:bg-tide/5">
            个性化作业
          </Link>
          <Link href="/courses" className="rounded-xl border border-tide/20 px-5 py-3 text-sm font-medium text-tide transition hover:bg-tide/5">
            全部课程
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        {focusTracks.map((track) => (
          <article key={track.title} className="rounded-2xl border border-tide/10 bg-white/80 p-5">
            <h2 className="text-xl font-semibold text-tide">{track.title}</h2>
            <p className="mt-2 text-sm text-ink/75">{track.description}</p>
            <p className="mt-3 text-xs font-semibold tracking-wide text-accent">{track.timeline}</p>
            <Link href={track.href} className="mt-4 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90">
              查看详情
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <article className="rounded-2xl border border-tide/10 bg-white/80 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-tide">当前进度与下一步</h2>
              <p className="mt-2 text-sm text-ink/75">这是站点当前建设节奏，方便学生和家长了解更新计划。</p>
            </div>
            <Link href="/about" className="rounded-xl border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
              查看说明
            </Link>
          </div>
          <ol className="mt-4 grid gap-3 md:grid-cols-3">
            {nextMilestones.map((item, index) => (
              <li key={item} className="rounded-xl border border-tide/10 bg-white p-4 text-sm text-ink/80">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-tide text-xs text-white">{index + 1}</span>
                {item}
              </li>
            ))}
          </ol>
        </article>
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-tide">覆盖章节</h2>
          <Link href="/courses" className="text-sm font-medium text-accent hover:underline">
            课程总览
          </Link>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          {latestChapters.map((chapter) => (
            <span key={chapter} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-tide ring-1 ring-tide/15">
              {chapter}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-tide">最新课程</h2>
          <Link href="/courses" className="text-sm font-medium text-accent hover:underline">
            查看全部
          </Link>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latestCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
}
