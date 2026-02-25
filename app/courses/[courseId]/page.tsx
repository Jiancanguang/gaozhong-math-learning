import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getCourseContent, getRelatedCourses, mapChapterName, toEmbedVideoUrl } from '@/lib/courses';

type CourseDetailPageProps = {
  params: {
    courseId: string;
  };
};

export const dynamic = 'force-dynamic';

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const result = await getCourseContent(params.courseId);
  if (!result) notFound();

  const { meta, content } = result;
  const related = getRelatedCourses(meta, 3);
  const embedUrl = toEmbedVideoUrl(meta.videoUrl);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <Link href="/courses" className="text-sm font-medium text-accent hover:underline">
        ← 返回课程列表
      </Link>

      <header className="mt-3 rounded-2xl border border-tide/10 bg-white/80 p-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">
          高{meta.grade === '10' ? '一' : '二'} / {mapChapterName(meta.chapter)} / {meta.duration}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-tide">{meta.title}</h1>
        <p className="mt-3 text-sm text-ink/75">{meta.summary}</p>
      </header>

      <section className="mt-6 overflow-hidden rounded-2xl border border-tide/10 bg-black shadow-card">
        {embedUrl ? (
          <div className="relative aspect-video w-full">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={embedUrl}
              title={`${meta.title} 视频讲解`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center px-6 text-center text-sm text-white/80">
            当前课程暂未配置视频。请在课程 MDX 的 frontmatter 中填写 videoUrl（支持 B 站视频链接、BV 号、av 号）。
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-tide/10 bg-white/90 p-6">
        <h2 className="text-xl font-semibold text-tide">课程讲义</h2>
        <article className="mdx-content mt-4 text-[15px] leading-7">{content}</article>
      </section>

      <section className="mt-8 rounded-2xl border border-tide/10 bg-white/80 p-6">
        <h2 className="text-xl font-semibold text-tide">下一节推荐</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {related.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="rounded-xl border border-tide/10 bg-paper p-4 transition hover:border-accent/50">
              <p className="text-xs text-ink/60">{mapChapterName(course.chapter)}</p>
              <p className="mt-2 text-sm font-medium text-ink">{course.title}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
