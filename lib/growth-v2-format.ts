/**
 * Shared formatting helpers for Growth V2 admin pages.
 */

/** Extract the first string from a search-param that may be a single value or array. */
export function firstValue(v?: string | string[]): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** Format a nullable number with fixed decimals (default 1). */
export function fmt(v: number | null, d = 1): string {
  return v === null ? '--' : v.toFixed(d);
}

/** Format a nullable number as a percentage string. */
export function fmtPct(v: number | null): string {
  return v === null ? '--' : `${v.toFixed(1)}%`;
}

/** Format class-rank / grade-rank pair. */
export function fmtRank(classRank: number | null, gradeRank: number | null): string {
  if (classRank !== null && gradeRank !== null) return `班${classRank} / 级${gradeRank}`;
  if (classRank !== null) return `班${classRank}`;
  if (gradeRank !== null) return `级${gradeRank}`;
  return '--';
}

/** Format a time range from start/end strings. */
export function fmtTime(start: string | null, end: string | null): string {
  if (!start && !end) return '--';
  if (start && end) return `${start} - ${end}`;
  return start ?? end ?? '--';
}
