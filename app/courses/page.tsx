import { CourseCard } from '@/components/course-card';
import { getAllCourses, getChapters, mapChapterName } from '@/lib/courses';

type CoursesPageProps = {
  searchParams: {
    grade?: string;
    chapter?: string;
    q?: string;
  };
};

export default function CoursesPage({ searchParams }: CoursesPageProps) {
  const courses = getAllCourses();
  const chapters = getChapters();

  const gradeFilter = searchParams.grade;
  const chapterFilter = searchParams.chapter;
  const query = (searchParams.q ?? '').trim().toLowerCase();

  const filtered = courses.filter((course) => {
    const gradeMatch = gradeFilter ? course.grade === gradeFilter : true;
    const chapterMatch = chapterFilter ? course.chapter === chapterFilter : true;
    const queryMatch = query
      ? course.title.toLowerCase().includes(query) ||
        course.tags.join(' ').toLowerCase().includes(query) ||
        mapChapterName(course.chapter).toLowerCase().includes(query)
      : true;

    return gradeMatch && chapterMatch && queryMatch;
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-tide">课程列表</h1>
      <p className="mt-3 text-sm text-ink/75">当前以高一下同步课程为主，支持按年级、章节和关键词检索。</p>

      <form className="mt-6 grid gap-3 rounded-2xl border border-tide/10 bg-white/80 p-4 md:grid-cols-4">
        <select name="grade" defaultValue={gradeFilter ?? ''} className="rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent">
          <option value="">全部年级</option>
          <option value="10">高一</option>
          <option value="11">高二</option>
        </select>
        <select
          name="chapter"
          defaultValue={chapterFilter ?? ''}
          className="rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">全部章节</option>
          {chapters.map((chapter) => (
            <option value={chapter} key={chapter}>
              {mapChapterName(chapter)}
            </option>
          ))}
        </select>
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="搜索标题或标签，例如 导数"
          className="rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button type="submit" className="rounded-lg bg-tide px-4 py-2 text-sm font-medium text-white transition hover:bg-tide/90">
          筛选课程
        </button>
      </form>

      <p className="mt-4 text-sm text-ink/70">共匹配 {filtered.length} 节课程</p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-tide/25 bg-white/70 p-6 text-sm text-ink/70">
          没有找到符合条件的课程。请尝试更换筛选条件或关键词。
        </div>
      ) : null}
    </div>
  );
}
