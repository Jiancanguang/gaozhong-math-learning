import type { GrowthStudentStatus } from '@/lib/growth-v2-store';

type GrowthV2StudentFormGroup = {
  id: string;
  name: string;
  gradeLabel: string;
};

export type GrowthV2StudentFormValues = {
  name: string;
  gradeLabel: string;
  homeGroupId: string;
  status: GrowthStudentStatus;
  notes: string;
  parentAccessToken?: string;
};

type GrowthV2StudentFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  cancelHref: string;
  groups: GrowthV2StudentFormGroup[];
  gradeOptions: string[];
  values?: GrowthV2StudentFormValues;
  errorMessage?: string;
};

const defaultValues: GrowthV2StudentFormValues = {
  name: '',
  gradeLabel: '高一',
  homeGroupId: '',
  status: 'active',
  notes: ''
};

export function GrowthV2StudentForm({
  action,
  submitLabel,
  cancelHref,
  groups,
  gradeOptions,
  values = defaultValues,
  errorMessage
}: GrowthV2StudentFormProps) {
  const normalizedGradeOptions = Array.from(new Set([values.gradeLabel, ...gradeOptions].filter(Boolean))).sort((left, right) =>
    left.localeCompare(right, 'zh-CN')
  );
  const gradeDatalistId = 'growth-v2-grade-options';

  return (
    <form action={action} className="rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
      {errorMessage ? <p className="rounded-lg border border-[#e05555]/30 bg-[#f7dede] px-3 py-2 text-sm text-[#e05555]">{errorMessage}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink/80">学生姓名</span>
          <input
            name="name"
            defaultValue={values.name}
            required
            placeholder="例如：李明"
            className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink/80">年级标签</span>
          <input
            name="gradeLabel"
            defaultValue={values.gradeLabel}
            required
            list={gradeDatalistId}
            placeholder="例如：高二"
            className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
          />
          <datalist id={gradeDatalistId}>
            {normalizedGradeOptions.map((gradeLabel) => (
              <option key={gradeLabel} value={gradeLabel} />
            ))}
          </datalist>
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink/80">常驻班组</span>
          <select
            name="homeGroupId"
            defaultValue={values.homeGroupId}
            className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
          >
            <option value="">暂不分配班组</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
                {group.gradeLabel ? ` · ${group.gradeLabel}` : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink/80">状态</span>
          <select
            name="status"
            defaultValue={values.status}
            className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
          >
            <option value="active">在读</option>
            <option value="archived">归档</option>
          </select>
        </label>

        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-ink/80">备注</span>
          <textarea
            name="notes"
            defaultValue={values.notes}
            rows={4}
            placeholder="可选，记录家长沟通、分班说明或特殊情况。"
            className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
          />
        </label>
      </div>

      <div className="mt-5 rounded-xl border border-tide/10 bg-paper/50 px-4 py-3 text-sm text-ink/70">
        {values.parentAccessToken ? (
          <p>
            家长页 Token：<code className="rounded bg-white px-2 py-1 text-xs text-tide">{values.parentAccessToken}</code>
          </p>
        ) : (
          <p>保存后会自动生成家长页 Token，用于 `/growth-v2/parent/[token]` 的专属访问链接。</p>
        )}
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
