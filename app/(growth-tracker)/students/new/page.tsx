import type { Metadata } from 'next';
import Link from 'next/link';
import { GRADES } from '@/lib/score-tracker';
import { GRADE_LABELS, getDistinctGroupNames } from '@/lib/growth-tracker';
import { createStudentAction } from '@/app/(growth-tracker)/students/actions';

export const metadata: Metadata = {
  title: '添加学生 — 筑学工作室'
};

type Props = {
  searchParams: { error?: string };
};

export default async function NewStudentPage({ searchParams }: Props) {
  const groupNames = await getDistinctGroupNames();
  const error = searchParams.error;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={'/students' as never} className="text-sm text-ink/50 hover:text-gt-primary">
          ← 返回列表
        </Link>
        <h1 className="text-2xl font-semibold text-gt-primary">添加学生</h1>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-rose-300/70 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error === 'validation' ? '请填写必填字段。' : '保存失败，请重试。'}
        </p>
      ) : null}

      <form action={createStudentAction} className="mt-6 space-y-4 rounded-2xl border border-gt-primary/10 bg-white/90 p-6 shadow-card">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-ink">
            姓名 <span className="text-gt-red">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-1.5 w-full rounded-lg border border-gt-primary/20 bg-white px-3 py-2 text-sm outline-none focus:border-gt-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="grade" className="text-sm font-medium text-ink">
              年级 <span className="text-gt-red">*</span>
            </label>
            <select
              id="grade"
              name="grade"
              required
              className="mt-1.5 w-full rounded-lg border border-gt-primary/20 bg-white px-3 py-2 text-sm outline-none focus:border-gt-accent"
            >
              <option value="">请选择</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>{GRADE_LABELS[g]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="groupName" className="text-sm font-medium text-ink">
              班组
            </label>
            <input
              id="groupName"
              name="groupName"
              type="text"
              list="group-names"
              placeholder="如：周六上午班"
              className="mt-1.5 w-full rounded-lg border border-gt-primary/20 bg-white px-3 py-2 text-sm outline-none focus:border-gt-accent"
            />
            <datalist id="group-names">
              {groupNames.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-gt-primary px-5 py-2 text-sm font-medium text-white transition hover:bg-gt-primary/90"
          >
            保存
          </button>
          <Link
            href={'/students' as never}
            className="rounded-lg border border-gt-primary/20 px-5 py-2 text-sm text-ink/60 transition hover:text-gt-primary"
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}
