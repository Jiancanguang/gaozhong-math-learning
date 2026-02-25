import Link from 'next/link';

import type { Course } from '@/lib/courses';
import { mapChapterName } from '@/lib/course-meta';

type CourseCardProps = {
  course: Course;
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-tide/10 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-3 flex items-center gap-2 text-xs">
        <span className="rounded-full bg-tide/10 px-2 py-1 font-medium text-tide">高{course.grade === '10' ? '一' : '二'}</span>
        <span className="rounded-full bg-accent/10 px-2 py-1 font-medium text-accent">{mapChapterName(course.chapter)}</span>
      </div>
      <h3 className="text-lg font-semibold text-ink">{course.title}</h3>
      <p className="mt-2 text-sm text-ink/70">{course.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {course.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-md bg-paper px-2 py-1 text-xs text-ink/80">
            #{tag}
          </span>
        ))}
      </div>
      <div className="mt-auto pt-6 text-xs text-ink/60">
        <p>时长：{course.duration}</p>
        <p>更新：{course.updatedAt}</p>
      </div>
      <Link
        href={`/courses/${course.id}`}
        className="mt-4 inline-flex items-center justify-center rounded-xl bg-tide px-4 py-2 text-sm font-medium text-white transition hover:bg-tide/90"
      >
        进入课程
      </Link>
    </article>
  );
}
