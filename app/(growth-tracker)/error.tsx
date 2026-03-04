'use client';

export default function GrowthTrackerError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-gt-primary">页面出错了</h1>
      <p className="mt-3 text-sm text-ink/60">
        错误信息：{error.message}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-gt-primary px-5 py-2 text-sm font-medium text-white transition hover:bg-gt-primary/90"
      >
        重试
      </button>
    </div>
  );
}
