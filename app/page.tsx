import type { Route } from 'next';
import Link from 'next/link';

import { CourseCard } from '@/components/course-card';
import { getLatestCourses, mapChapterName } from '@/lib/courses';

const focusTracks = [
  {
    title: '高一下同步课程',
    description: '按学校进度稳步推进，先把函数、数列、三角和解析几何学清楚。',
    timeline: '每周更新 2-3 节',
    href: '/courses?grade=10' as Route
  },
  {
    title: '高三高考真题讲解',
    description: '按年份和题型拆真题，抓思路、得分点和高频失分环节。',
    timeline: '持续更新中',
    href: '/gaokao' as Route
  }
];

const profileHighlights = [
  '同步课程',
  '真题讲解',
  '系统提分',
  '看得懂 + 做得出 + 能复盘'
];

const nextMilestones = [
  '持续补齐高一下核心章节',
  '按专题更新高三真题讲解',
  '把课程、作业和提分工具逐步连成闭环'
];

export default function HomePage() {
  const assignmentHref = '/assignment' as Route;
  const gaokaoHref = '/gaokao' as Route;
  const gaokaoSystemHref = '/gaokao-system' as Route;
  const roadmapHref = '/roadmap' as Route;
  const resourcesHref = '/resources' as Route;
  const latestCourses = getLatestCourses(6);
  const latestChapters = Array.from(new Set(latestCourses.map((course) => course.chapter))).map((chapter) => mapChapterName(chapter));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-tide/10 bg-white/80 p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Personal Teaching Hub</p>
        <h1 className="mt-3 text-3xl font-semibold text-tide sm:text-4xl">高中数学，不只学懂，更要稳稳提分</h1>
        <p className="mt-4 max-w-3xl text-base text-ink/80">
          这是我的数学教学主站。这里既有高一下同步课程，也有高三真题讲解和系统提分方法，目标很明确：把知识点讲清楚，把题型做出来，把错误复盘掉。
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
            进入同步课程
          </Link>
          <Link href={gaokaoHref} className="rounded-xl bg-tide px-5 py-3 text-sm font-medium text-white transition hover:bg-tide/90">
            进入真题专区
          </Link>
          <Link href={gaokaoSystemHref} className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-tide ring-1 ring-tide/20 transition hover:bg-tide/5">
            进入提分专区
          </Link>
          <Link href={roadmapHref} className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-tide ring-1 ring-tide/20 transition hover:bg-tide/5">
            查看学习路径
          </Link>
          <Link href={assignmentHref} className="rounded-xl border border-tide/20 px-5 py-3 text-sm font-medium text-tide transition hover:bg-tide/5">
            生成作业方案
          </Link>
          <Link href={resourcesHref} className="rounded-xl border border-tide/20 px-5 py-3 text-sm font-medium text-tide transition hover:bg-tide/5">
            打开资料库
          </Link>
          <Link href="/courses" className="rounded-xl border border-tide/20 px-5 py-3 text-sm font-medium text-tide transition hover:bg-tide/5">
            浏览全部内容
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
              <h2 className="text-2xl font-semibold text-tide">当前重点</h2>
              <p className="mt-2 text-sm text-ink/75">网站框架已经基本成型，接下来重点是持续补内容、补专题、补工具。</p>
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
          <h2 className="text-2xl font-semibold text-tide">当前覆盖内容</h2>
          <Link href="/courses" className="text-sm font-medium text-accent hover:underline">
            浏览课程库
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
          <h2 className="text-2xl font-semibold text-tide">最新上线</h2>
          <Link href="/courses" className="text-sm font-medium text-accent hover:underline">
            查看全部内容
          </Link>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latestCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <article className="rounded-2xl border border-tide/10 bg-white/80 p-6">
          <h2 className="text-2xl font-semibold text-tide">联系我</h2>
          <p className="mt-2 text-sm text-ink/80">想补某个章节、某套真题，或者发现讲义问题，都可以直接联系我。</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-lg bg-tide/10 px-3 py-2 text-tide">邮箱：jiancanguang@qq.com</span>
            <span className="rounded-lg bg-tide/10 px-3 py-2 text-tide">B 站 / 抖音 / 公众号：主页持续更新</span>
          </div>
          <Link href="/about" className="mt-4 inline-flex text-sm font-medium text-accent hover:underline">
            查看详细说明
          </Link>
        </article>
      </section>
    </div>
  );
}
