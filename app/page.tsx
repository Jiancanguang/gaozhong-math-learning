import type { Route } from 'next';
import Link from 'next/link';

import { CourseCard } from '@/components/course-card';
import { getLatestCourses, mapChapterName } from '@/lib/courses';

const gradeTracks = [
  {
    grade: '10',
    label: '高一同步',
    description: '打牢函数、三角函数、数列与解析几何基础。'
  },
  {
    grade: '11',
    label: '高二同步',
    description: '重点突破立体几何、概率统计与导数初步。'
  }
];

const roadmap = [
  '先看 15-20 分钟短视频，建立知识图谱',
  '对照讲义做 2-3 道例题，关注解题结构',
  '完成课后小练，记录本课易错点',
  '隔天做同类题，形成长期记忆'
];

export default function HomePage() {
  const assignmentHref = '/assignment' as Route;
  const latestCourses = getLatestCourses(6);
  const latestChapters = Array.from(new Set(latestCourses.map((course) => course.chapter))).map((chapter) => mapChapterName(chapter));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-tide/10 bg-white/75 p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">高中数学 V1</p>
        <h1 className="mt-3 text-3xl font-semibold text-tide sm:text-4xl">高一高二同步课程学习平台</h1>
        <p className="mt-4 max-w-2xl text-base text-ink/80">
          每节课采用“短视频 + 讲义 + 例题 + 小练”结构，帮助学生在 30-40 分钟内完成一轮有效学习。
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          {latestChapters.map((chapter) => (
            <span key={chapter} className="rounded-full bg-tide/10 px-3 py-1 font-medium text-tide">
              {chapter}
            </span>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/roadmap" className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accent/90">
            必修二路径图
          </Link>
          <Link href="/courses" className="rounded-xl bg-tide px-5 py-3 text-sm font-medium text-white transition hover:bg-tide/90">
            开始学习
          </Link>
          <Link href={assignmentHref} className="rounded-xl border border-tide/20 px-5 py-3 text-sm font-medium text-tide transition hover:bg-tide/5">
            个性化作业
          </Link>
          <Link href="/about" className="rounded-xl border border-tide/20 px-5 py-3 text-sm font-medium text-tide transition hover:bg-tide/5">
            反馈与建议
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        {gradeTracks.map((track) => (
          <article key={track.grade} className="rounded-2xl border border-tide/10 bg-white/80 p-5">
            <h2 className="text-xl font-semibold text-tide">{track.label}</h2>
            <p className="mt-2 text-sm text-ink/75">{track.description}</p>
            <Link
              href={`/courses?grade=${track.grade}`}
              className="mt-4 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90"
            >
              查看课程
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <article className="rounded-2xl border border-tide/10 bg-white/80 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-tide">高中数学必修二学习路径图</h2>
              <p className="mt-2 text-sm text-ink/75">按教材第六到第十章（向量、复数、立体几何、统计、概率）可视化展示学习顺序。</p>
            </div>
            <Link href="/roadmap" className="rounded-xl border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
              打开路径图
            </Link>
          </div>
        </article>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-tide">学习路径建议</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-2">
          {roadmap.map((item, index) => (
            <li key={item} className="rounded-xl border border-tide/10 bg-white p-4 text-sm text-ink/80">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-tide text-xs text-white">{index + 1}</span>
              {item}
            </li>
          ))}
        </ol>
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
