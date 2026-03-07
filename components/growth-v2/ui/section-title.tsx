type SectionTitleProps = {
  title: string;
  color?: string;
};

export function SectionTitle({ title, color = 'bg-tide' }: SectionTitleProps) {
  return (
    <div className="flex items-center gap-3">
      <span className={`inline-block h-5 w-1 rounded-full ${color}`} />
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <span className="flex-1 border-t border-dashed border-border-light" />
    </div>
  );
}
