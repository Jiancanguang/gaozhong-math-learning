const MASTERY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  lv985: { bg: 'bg-[#faf0d8]', text: 'text-[#c2841a]', label: '985' },
  lvtk: { bg: 'bg-[#f0e6f8]', text: 'text-[#6b21a8]', label: '特控线' },
  lveb: { bg: 'bg-[#e3edf8]', text: 'text-[#2b5797]', label: '二本线' },
  lvbk: { bg: 'bg-[#e0f5e9]', text: 'text-[#16a34a]', label: '本科线' },
  lvzk: { bg: 'bg-[#f7dede]', text: 'text-[#e05555]', label: '专科' }
};

type MasteryBadgeProps = {
  value: string | null;
};

export function MasteryBadge({ value }: MasteryBadgeProps) {
  if (!value) return <span className="text-text-muted">--</span>;
  const style = MASTERY_STYLES[value];
  if (!style) return <span className="text-text-muted">{value}</span>;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}
