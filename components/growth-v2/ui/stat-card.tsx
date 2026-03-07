type StatCardProps = {
  label: string;
  value: string;
  sub?: string;
  colorClass: string;
  valueColorClass: string;
};

export function StatCard({ label, value, sub, colorClass, valueColorClass }: StatCardProps) {
  return (
    <article
      className={`relative overflow-hidden rounded-xl border border-border-light p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${colorClass}`}
    >
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20" style={{ background: 'currentColor' }} />
      <p className="text-xs font-semibold text-text-light">{label}</p>
      <p className={`mt-2 font-serif text-4xl font-black ${valueColorClass}`}>{value}</p>
      {sub ? <p className="mt-1 text-xs text-text-muted">{sub}</p> : null}
    </article>
  );
}
