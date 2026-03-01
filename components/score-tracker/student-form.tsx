import type { Grade } from '@/lib/score-tracker';
import { GRADES } from '@/lib/score-tracker';

type StudentFormValues = {
  name: string;
  grade: Grade;
  className: string;
  headTeacher: string;
  isActive: boolean;
  notes: string;
};

type StudentFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  cancelHref: string;
  values?: StudentFormValues;
  errorMessage?: string;
};

const defaultValues: StudentFormValues = {
  name: '',
  grade: '10',
  className: '',
  headTeacher: '',
  isActive: true,
  notes: ''
};

export function StudentForm({ action, submitLabel, cancelHref, values = defaultValues, errorMessage }: StudentFormProps) {
  return (
    <form action={action} className="rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
      {errorMessage ? <p className="rounded-lg border border-rose-300/70 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p> : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink/80">学生姓名</span>
          <input
            name="name"
            defaultValue={values.name}
            required
            className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink/80">年级</span>
          <select
            name="grade"
            defaultValue={values.grade}
            className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
          >
            {GRADES.map((grade) => (
              <option key={grade} value={grade}>
                高{grade === '10' ? '一' : grade === '11' ? '二' : '三'}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-ink/80">班级</span>
          <input
            name="className"
            defaultValue={values.className}
            required
            placeholder="例如：高二（3）班"
            className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink/80">班主任</span>
          <input
            name="headTeacher"
            defaultValue={values.headTeacher}
            placeholder="例如：张老师"
            className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink/80">是否在读</span>
          <select
            name="isActive"
            defaultValue={values.isActive ? 'true' : 'false'}
            className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
          >
            <option value="true">在读</option>
            <option value="false">已结课/不在读</option>
          </select>
        </label>

        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-ink/80">备注</span>
          <textarea
            name="notes"
            defaultValue={values.notes}
            rows={4}
            placeholder="可选，记录补充说明。"
            className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
          />
        </label>
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
