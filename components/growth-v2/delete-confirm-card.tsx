type GrowthV2DeleteConfirmCardProps = {
  title: string;
  description: string;
  confirmLabel: string;
  confirmValue: string;
  impactItems: string[];
  action: (formData: FormData) => void | Promise<void>;
  cancelHref: string;
  submitLabel: string;
  errorMessage?: string;
};

export function GrowthV2DeleteConfirmCard({
  title,
  description,
  confirmLabel,
  confirmValue,
  impactItems,
  action,
  cancelHref,
  submitLabel,
  errorMessage
}: GrowthV2DeleteConfirmCardProps) {
  return (
    <form action={action} className="rounded-2xl border border-[#e05555]/30/70 bg-white/95 p-6 shadow-card">
      <div className="rounded-2xl border border-[#e05555]/30 bg-[#f7dede]/70 p-5">
        <h2 className="text-xl font-semibold text-[#e05555]">{title}</h2>
        <p className="mt-2 text-sm text-[#c44040]/85">{description}</p>
      </div>

      {errorMessage ? <p className="mt-4 rounded-lg border border-[#f0932b]/30 bg-[#f7ead5] px-3 py-2 text-sm text-[#b8720a]">{errorMessage}</p> : null}

      <div className="mt-5 rounded-2xl border border-border-light bg-surface-alt p-5">
        <p className="text-sm font-medium text-ink">本次删除会影响</p>
        <ul className="mt-3 space-y-2 text-sm text-ink/75">
          {impactItems.map((item) => (
            <li key={item} className="rounded-lg border border-border-light bg-white px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <label className="mt-5 block text-sm">
        <span className="mb-1 block font-medium text-ink/80">
          输入{confirmLabel}
          <code className="ml-2 rounded bg-surface-alt px-2 py-1 text-xs text-ink">{confirmValue}</code>
          以确认删除
        </span>
        <input
          name="confirmationText"
          required
          autoComplete="off"
          spellCheck={false}
          placeholder={`请输入：${confirmValue}`}
          className="w-full rounded-lg border border-border-default bg-white px-3 py-2 outline-none transition focus:border-[#e05555]"
        />
      </label>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" className="rounded-lg bg-[#e05555] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#e05555]">
          {submitLabel}
        </button>
        <a href={cancelHref} className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
          取消
        </a>
      </div>
    </form>
  );
}
