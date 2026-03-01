import { EXAM_TYPE_LABELS, EXAM_TYPES, SUBJECT_LABELS, SUBJECTS, type ExamType, type StudentExamRecord, type Subject } from '@/lib/score-tracker';

type ExamFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  cancelHref: string;
  errorMessage?: string;
  values?: StudentExamRecord | null;
  deleteAction?: (() => void | Promise<void>) | null;
};

function getSubjectValue(record: StudentExamRecord | null | undefined, subject: Subject) {
  const entry = record?.subjectScores.find((item) => item.subject === subject);
  return {
    score: entry?.score ?? '',
    fullScore: entry?.fullScore ?? ''
  };
}

export function ExamForm({ action, submitLabel, cancelHref, errorMessage, values, deleteAction }: ExamFormProps) {
  return (
    <div className="space-y-5">
      <form action={action} className="rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
        {errorMessage ? <p className="rounded-lg border border-rose-300/70 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p> : null}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-ink/80">考试名称</span>
            <input
              name="examName"
              defaultValue={values?.examName ?? ''}
              required
              placeholder="例如：2026 广一模"
              className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-ink/80">考试类型</span>
            <select
              name="examType"
              defaultValue={values?.examType ?? ('monthly' satisfies ExamType)}
              className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
            >
              {EXAM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {EXAM_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-ink/80">考试日期</span>
            <input
              type="date"
              name="examDate"
              defaultValue={values?.examDate ?? ''}
              required
              className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-ink/80">总分</span>
            <input
              type="number"
              name="totalScore"
              defaultValue={values?.totalScore ?? ''}
              step="0.01"
              required
              className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-ink/80">总分满分</span>
            <input
              type="number"
              name="totalFullScore"
              defaultValue={values?.totalFullScore ?? ''}
              step="0.01"
              className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-ink/80">班排</span>
            <input
              type="number"
              name="classRank"
              defaultValue={values?.classRank ?? ''}
              step="1"
              className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-ink/80">年排</span>
            <input
              type="number"
              name="gradeRank"
              defaultValue={values?.gradeRank ?? ''}
              step="1"
              className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
            />
          </label>

          <label className="text-sm md:col-span-2">
            <span className="mb-1 block font-medium text-ink/80">备注</span>
            <textarea
              name="notes"
              defaultValue={values?.notes ?? ''}
              rows={4}
              placeholder="可选，记录本次考试的补充信息。"
              className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
            />
          </label>
        </div>

        <div className="mt-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-tide">各科成绩</h2>
              <p className="mt-1 text-sm text-ink/70">只填写本次考试实际录入的科目，空项不会保存。</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {SUBJECTS.map((subject) => {
              const defaultValue = getSubjectValue(values, subject);
              return (
                <div key={subject} className="grid gap-3 rounded-xl border border-tide/10 bg-paper/60 p-4 md:grid-cols-[140px_1fr_1fr] md:items-center">
                  <p className="text-sm font-semibold text-tide">{SUBJECT_LABELS[subject]}</p>
                  <label className="text-sm">
                    <span className="mb-1 block text-ink/75">分数</span>
                    <input
                      type="number"
                      name={`${subject}Score`}
                      defaultValue={defaultValue.score}
                      step="0.01"
                      className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block text-ink/75">满分</span>
                    <input
                      type="number"
                      name={`${subject}FullScore`}
                      defaultValue={defaultValue.fullScore}
                      step="0.01"
                      className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
                    />
                  </label>
                </div>
              );
            })}
          </div>
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

      {deleteAction ? (
        <form action={deleteAction} className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <p className="text-sm text-rose-800">删除后，本次考试记录和对应科目成绩会一起清除。</p>
          <button type="submit" className="mt-3 rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-white/70">
            删除本次考试记录
          </button>
        </form>
      ) : null}
    </div>
  );
}
