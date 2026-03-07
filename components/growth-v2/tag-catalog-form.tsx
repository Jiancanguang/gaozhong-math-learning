type GrowthV2TagCatalogFormValues = {
  category: string;
  tagName: string;
  sortOrder: string;
  isActive: boolean;
};

type GrowthV2TagCatalogFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  cancelHref: string;
  categoryOptions: string[];
  values?: GrowthV2TagCatalogFormValues;
  errorMessage?: string;
};

const defaultValues: GrowthV2TagCatalogFormValues = {
  category: '',
  tagName: '',
  sortOrder: '0',
  isActive: true
};

export function GrowthV2TagCatalogForm({
  action,
  submitLabel,
  cancelHref,
  categoryOptions,
  values = defaultValues,
  errorMessage
}: GrowthV2TagCatalogFormProps) {
  const datalistId = 'growth-v2-tag-categories';
  const normalizedCategories = Array.from(new Set([values.category, ...categoryOptions].filter(Boolean))).sort((left, right) =>
    left.localeCompare(right, 'zh-CN')
  );

  return (
    <form action={action} className="rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
      {errorMessage ? <p className="rounded-lg border border-[#e05555]/30 bg-[#f7dede] px-3 py-2 text-sm text-[#e05555]">{errorMessage}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink/80">标签分类</span>
          <input
            name="category"
            defaultValue={values.category}
            required
            list={datalistId}
            placeholder="例如：导数"
            className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
          />
          <datalist id={datalistId}>
            {normalizedCategories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink/80">标签名称</span>
          <input
            name="tagName"
            defaultValue={values.tagName}
            required
            placeholder="例如：导数综合应用"
            className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink/80">排序值</span>
          <input
            name="sortOrder"
            type="number"
            min="0"
            step="1"
            defaultValue={values.sortOrder}
            className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink/80">是否启用</span>
          <select
            name="isActive"
            defaultValue={values.isActive ? 'true' : 'false'}
            className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
          >
            <option value="true">启用</option>
            <option value="false">停用</option>
          </select>
        </label>
      </div>

      <div className="mt-5 rounded-xl border border-tide/10 bg-paper/50 px-4 py-3 text-sm text-ink/70">
        这里维护的是考试薄弱点标签目录。停用后，历史数据仍保留，只是不再出现在新的考试录入快捷标签里。
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" className="rounded-lg bg-tide px-4 py-2 text-sm font-medium text-white transition hover:bg-tide/90">
          {submitLabel}
        </button>
        <a href={cancelHref} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
          取消
        </a>
      </div>
    </form>
  );
}
