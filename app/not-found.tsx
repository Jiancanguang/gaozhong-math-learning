import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold text-tide">课程不存在</h1>
      <p className="mt-3 text-sm text-ink/75">你访问的课程可能尚未发布，或链接已失效。</p>
      <Link href="/courses" className="mt-6 rounded-lg bg-tide px-4 py-2 text-sm font-medium text-white">
        返回课程列表
      </Link>
    </div>
  );
}
