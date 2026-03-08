import type { Route } from 'next';
import Link from 'next/link';

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  /** Build the href for a given page number. */
  buildHref: (page: number) => string;
};

export function Pagination({ page, pageSize, total, buildHref }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav className="mt-4 flex items-center justify-between rounded-xl border border-border-light bg-surface px-4 py-3">
      <p className="text-sm text-text-muted">
        共 {total} 条，第 {page}/{totalPages} 页
      </p>
      <div className="flex gap-2">
        {hasPrev ? (
          <Link href={buildHref(page - 1) as Route} className="rounded-lg border border-border-default px-3 py-1.5 text-sm text-text-light transition hover:bg-surface-alt">
            上一页
          </Link>
        ) : (
          <span className="rounded-lg border border-border-light px-3 py-1.5 text-sm text-text-muted/50">
            上一页
          </span>
        )}
        {hasNext ? (
          <Link href={buildHref(page + 1) as Route} className="rounded-lg border border-border-default px-3 py-1.5 text-sm text-text-light transition hover:bg-surface-alt">
            下一页
          </Link>
        ) : (
          <span className="rounded-lg border border-border-light px-3 py-1.5 text-sm text-text-muted/50">
            下一页
          </span>
        )}
      </div>
    </nav>
  );
}
