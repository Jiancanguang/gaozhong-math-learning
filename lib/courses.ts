import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';
import { mapChapterName } from '@/lib/course-meta';
import { getVideoOverrideByCourseId } from '@/lib/video-overrides';

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

export type VideoEmbedHint = {
  embedUrl: string;
  tone: 'muted' | 'emerald' | 'amber';
  message: string;
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
      videoUrl: String(frontmatter.videoUrl ?? ''),
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
    const overrideVideoUrl = await getVideoOverrideByCourseId(courseId);
    if (overrideVideoUrl) {
      meta.videoUrl = overrideVideoUrl;
    }

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
  const raw = url.trim();
  if (!raw) return '';

  const bvMatch = raw.match(/(BV[0-9A-Za-z]{10})/);
  if (bvMatch?.[1]) {
    return `https://player.bilibili.com/player.html?bvid=${bvMatch[1]}&page=1`;
  }

  const avMatch = raw.match(/(?:^|[^0-9])(av\d{1,12})(?:$|[^0-9])/i);
  if (avMatch?.[1]) {
    return `https://player.bilibili.com/player.html?aid=${avMatch[1].replace(/^av/i, '')}&page=1`;
  }

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.toLowerCase();

    if (host === 'player.bilibili.com' && parsed.pathname.includes('/player.html')) {
      return parsed.toString();
    }

    if (host.includes('bilibili.com')) {
      const page = Number(parsed.searchParams.get('p') ?? '1') || 1;
      const pathBv = parsed.pathname.match(/\/video\/(BV[0-9A-Za-z]{10})/i)?.[1];
      if (pathBv) {
        return `https://player.bilibili.com/player.html?bvid=${pathBv}&page=${page}`;
      }

      const pathAv = parsed.pathname.match(/\/video\/av(\d{1,12})/i)?.[1];
      if (pathAv) {
        return `https://player.bilibili.com/player.html?aid=${pathAv}&page=${page}`;
      }

      const bvid = parsed.searchParams.get('bvid');
      if (bvid) {
        return `https://player.bilibili.com/player.html?bvid=${bvid}&page=${page}`;
      }

      const aid = parsed.searchParams.get('aid');
      if (aid) {
        return `https://player.bilibili.com/player.html?aid=${aid}&page=${page}`;
      }
    }
  } catch {
    // Unsupported URL formats fall through to an empty embed URL.
  }

  return '';
}

export function toBilibiliWatchUrl(url: string): string {
  const raw = url.trim();
  if (!raw) return '';

  const bvMatch = raw.match(/(BV[0-9A-Za-z]{10})/);
  if (bvMatch?.[1]) {
    return `https://www.bilibili.com/video/${bvMatch[1]}`;
  }

  const avMatch = raw.match(/(?:^|[^0-9])(av\d{1,12})(?:$|[^0-9])/i);
  if (avMatch?.[1]) {
    return `https://www.bilibili.com/video/${avMatch[1].toLowerCase()}`;
  }

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.toLowerCase();

    if (host === 'player.bilibili.com' && parsed.pathname.includes('/player.html')) {
      const bvid = parsed.searchParams.get('bvid');
      if (bvid) return `https://www.bilibili.com/video/${bvid}`;

      const aid = parsed.searchParams.get('aid');
      if (aid) return `https://www.bilibili.com/video/av${aid}`;
    }

    if (host.includes('bilibili.com')) {
      const pathBv = parsed.pathname.match(/\/video\/(BV[0-9A-Za-z]{10})/i)?.[1];
      if (pathBv) return `https://www.bilibili.com/video/${pathBv}`;

      const pathAv = parsed.pathname.match(/\/video\/av(\d{1,12})/i)?.[1];
      if (pathAv) return `https://www.bilibili.com/video/av${pathAv}`;

      const bvid = parsed.searchParams.get('bvid');
      if (bvid) return `https://www.bilibili.com/video/${bvid}`;

      const aid = parsed.searchParams.get('aid');
      if (aid) return `https://www.bilibili.com/video/av${aid}`;
    }
  } catch {
    // Unsupported URL formats fall through to an empty watch URL.
  }

  return '';
}

export function getVideoEmbedHint(url: string): VideoEmbedHint {
  const raw = url.trim();
  if (!raw) {
    return {
      embedUrl: '',
      tone: 'muted',
      message: '未配置视频链接。'
    };
  }

  const embedUrl = toEmbedVideoUrl(raw);
  if (!embedUrl) {
    return {
      embedUrl: '',
      tone: 'amber',
      message: '无法解析为可嵌入地址；目前仅支持 B 站链接、BV 号或 av 号。'
    };
  }

  if (raw.includes('player.bilibili.com/player.html')) {
    return {
      embedUrl,
      tone: 'emerald',
      message: '已使用 B 站播放器直链。'
    };
  }

  return {
    embedUrl,
    tone: 'amber',
    message: '已解析为 B 站播放器地址，但实际能否嵌入仍取决于视频版权、登录和外链限制。'
  };
}
