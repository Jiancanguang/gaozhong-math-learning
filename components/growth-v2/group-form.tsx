import type { GrowthGroupStatus } from '@/lib/growth-v2-store';

export type GrowthV2GroupFormValues = {
  name: string;
  teacherName: string;
  gradeLabel: string;
  status: GrowthGroupStatus;
  notes: string;
};

type GrowthV2GroupFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  cancelHref: string;
  values?: GrowthV2GroupFormValues;
  errorMessage?: string;
};

const defaultValues: GrowthV2GroupFormValues = {
  name: '',
  teacherName: '',
  gradeLabel: '高一',
  status: 'active',
  notes: ''
};

export function GrowthV2GroupForm({ action, submitLabel, cancelHref, values = defaultValues, errorMessage }: GrowthV2GroupFormProps) {
  return (
    <form action={action} className="rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
      {errorMessage ? <p className="rounded-lg border border-[#e05555]/30 bg-[#f7dede] px-3 py-2 text-sm text-[#e05555]">{errorMessage}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink/80">班组名称</span>
          <input
            name="name"
            defaultValue={values.name}
            required
            placeholder="例如：高二冲刺一班"
            className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink/80">年级标签</span>
          <input
            name="gradeLabel"
            defaultValue={values.gradeLabel}
            placeholder="例如：高二"
            className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink/80">任课老师</span>
          <input
            name="teacherName"
            defaultValue={values.teacherName}
            placeholder="例如：建灿老师"
            className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink/80">状态</span>
          <select
            name="status"
            defaultValue={values.status}
            className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
          >
            <option value="active">启用中</option>
            <option value="archived">已归档</option>
          </select>
        </label>

        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-ink/80">备注</span>
          <textarea
            name="notes"
            defaultValue={values.notes}
            rows={4}
            placeholder="可选，记录排课说明、班级定位或分层情况。"
            className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
          />
        </label>
      </div>

      <div className="mt-5 rounded-xl border border-tide/10 bg-paper/50 px-4 py-3 text-sm text-ink/70">
        学科默认使用 `math`，当前班组管理页主要维护名称、老师、年级与启用状态。
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
