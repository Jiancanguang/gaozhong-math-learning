import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';
import { mapChapterName } from '@/lib/course-meta';

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'courses');

export type Grade = '10' | '11';

export type Course = {
  id: string;
  title: string;
  grade: Grade;
  chapter: string;
  tags: string[];
  videoUrl: string;
  duration: string;
  updatedAt: string;
  order: number;
  summary: string;
};

type Frontmatter = Course;

function collectMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectMdxFiles(fullPath));
    if (entry.isFile() && entry.name.endsWith('.mdx')) files.push(fullPath);
  }

  return files;
}

function parseCourseFile(filePath: string): { meta: Course; content: string } {
  const source = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(source);

  const frontmatter = data as Partial<Frontmatter>;
  const courseId = path.basename(filePath, '.mdx');

  const requiredFields: Array<keyof Frontmatter> = [
    'title',
    'grade',
    'chapter',
    'videoUrl',
    'order',
    'summary',
    'duration',
    'updatedAt'
  ];

  for (const field of requiredFields) {
    if (frontmatter[field] === undefined || frontmatter[field] === null || frontmatter[field] === '') {
      throw new Error(`Missing frontmatter field \"${field}\" in ${filePath}`);
    }
  }

  return {
    meta: {
      id: courseId,
      title: String(frontmatter.title),
      grade: String(frontmatter.grade) as Grade,
      chapter: String(frontmatter.chapter),
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.map(String) : [],
      videoUrl: String(frontmatter.videoUrl),
      duration: String(frontmatter.duration),
      updatedAt: String(frontmatter.updatedAt),
      order: Number(frontmatter.order),
      summary: String(frontmatter.summary)
    },
    content
  };
}

export function getAllCourses(): Course[] {
  const files = collectMdxFiles(CONTENT_ROOT);
  const courses = files.map((file) => parseCourseFile(file).meta);

  return courses.sort((a, b) => {
    if (a.grade === b.grade) {
      if (a.chapter === b.chapter) return a.order - b.order;
      return a.chapter.localeCompare(b.chapter, 'zh-CN');
    }
    return Number(a.grade) - Number(b.grade);
  });
}

export function getCourseById(courseId: string): Course | null {
  const all = getAllCourses();
  return all.find((course) => course.id === courseId) ?? null;
}

export function getLatestCourses(limit = 6): Course[] {
  return [...getAllCourses()]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}

export function getChapters(): string[] {
  return Array.from(new Set(getAllCourses().map((course) => course.chapter)));
}

export function getRelatedCourses(current: Course, limit = 3): Course[] {
  return getAllCourses()
    .filter((course) => course.id !== current.id && (course.chapter === current.chapter || course.grade === current.grade))
    .slice(0, limit);
}

export async function getCourseContent(courseId: string) {
  const files = collectMdxFiles(CONTENT_ROOT);

  const target = files.find((file) => path.basename(file, '.mdx') === courseId);
  if (!target) return null;

  try {
    const { meta, content } = parseCourseFile(target);
    const mdx = await compileMDX({
      source: content,
      options: {
        parseFrontmatter: false
      }
    });

    return {
      meta,
      content: mdx.content
    };
  } catch (error) {
    console.error(`Failed to compile MDX for course: ${courseId}`, error);
    return null;
  }
}

export { mapChapterName };

export function toEmbedVideoUrl(url: string): string {
  if (url.includes('youtube.com/watch?v=')) {
    const u = new URL(url);
    const videoId = u.searchParams.get('v');
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }

  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }

  if (url.includes('bilibili.com/video/')) {
    const part = url.split('bilibili.com/video/')[1]?.split('?')[0];
    if (part) return `https://player.bilibili.com/player.html?bvid=${part}&page=1`;
  }

  return url;
}
