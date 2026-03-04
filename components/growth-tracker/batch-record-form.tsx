'use client';

import { useRef, useState } from 'react';
import type { Student } from '@/lib/score-tracker';
import type { MasteryLevel } from '@/lib/growth-tracker';

type StudentEntry = {
  id: string;
  name: string;
  entryScore: string;
  exitScore: string;
  performance: number;
  mastery: MasteryLevel | '';
  comment: string;
};

type Props = {
  groupNames: string[];
  studentsByGroup: Record<string, Pick<Student, 'id' | 'name' | 'grade'>[]>;
  action: (formData: FormData) => void;
};

export function BatchRecordForm({ groupNames, studentsByGroup, action }: Props) {
  const [selectedGroup, setSelectedGroup] = useState(groupNames[0] ?? '');
  const [entries, setEntries] = useState<StudentEntry[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function loadGroup(groupName: string) {
    setSelectedGroup(groupName);
    const students = studentsByGroup[groupName] ?? [];
    setEntries(
      students.map((s) => ({
        id: s.id,
        name: s.name,
        entryScore: '',
        exitScore: '',
        performance: 0,
        mastery: '',
        comment: ''
      }))
    );
    setShowSuccess(false);
  }

  function updateEntry(index: number, field: keyof StudentEntry, value: string | number) {
    setEntries((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      {showSuccess ? (
        <div className="mb-4 rounded-lg border border-emerald-300/60 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          记录保存成功！表单已清空，可以继续录入下一节课。
        </div>
      ) : null}

      <form ref={formRef} action={action}>
        {/* Lesson info */}
        <div className="rounded-2xl border border-gt-primary/10 bg-white/90 p-5 shadow-card">
          <h2 className="text-lg font-semibold text-gt-primary">课程信息</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-ink">班组 <span className="text-gt-red">*</span></label>
              <select
                name="groupName"
                value={selectedGroup}
                onChange={(e) => loadGroup(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gt-primary/20 bg-white px-3 py-2 text-sm outline-none focus:border-gt-accent"
              >
                <option value="">请选择班组</option>
                {groupNames.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-ink">日期 <span className="text-gt-red">*</span></label>
              <input
                name="date"
                type="date"
                defaultValue={today}
                className="mt-1 w-full rounded-lg border border-gt-primary/20 bg-white px-3 py-2 text-sm outline-none focus:border-gt-accent"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">本课主题 <span className="text-gt-red">*</span></label>
              <input
                name="topic"
                type="text"
                placeholder="如：正弦定理应用"
                className="mt-1 w-full rounded-lg border border-gt-primary/20 bg-white px-3 py-2 text-sm outline-none focus:border-gt-accent"
              />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-ink">进门考内容</label>
              <input
                name="entryTestTopic"
                type="text"
                placeholder="如：上节课·余弦定理"
                className="mt-1 w-full rounded-lg border border-gt-primary/20 bg-white px-3 py-2 text-sm outline-none focus:border-gt-accent"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">出门考内容</label>
              <input
                name="exitTestTopic"
                type="text"
                placeholder="如：本节课·正弦定理"
                className="mt-1 w-full rounded-lg border border-gt-primary/20 bg-white px-3 py-2 text-sm outline-none focus:border-gt-accent"
              />
            </div>
          </div>
        </div>

        {/* Student records */}
        {entries.length > 0 ? (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold text-gt-primary">学生录入（{entries.length} 人）</h2>
            {entries.map((entry, idx) => (
              <div key={entry.id} className="rounded-2xl border border-gt-primary/10 bg-white/90 p-4 shadow-card">
                <input type="hidden" name={`students[${idx}].id`} value={entry.id} />
                <p className="text-base font-medium text-gt-primary">{entry.name}</p>

                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div>
                    <label className="text-xs text-ink/60">进门考 (0-10)</label>
                    <input
                      name={`students[${idx}].entryScore`}
                      type="number"
                      min="0"
                      max="10"
                      step="1"
                      value={entry.entryScore}
                      onChange={(e) => updateEntry(idx, 'entryScore', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gt-primary/20 bg-white px-3 py-2 text-sm outline-none focus:border-gt-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-ink/60">出门考 (0-10)</label>
                    <input
                      name={`students[${idx}].exitScore`}
                      type="number"
                      min="0"
                      max="10"
                      step="1"
                      value={entry.exitScore}
                      onChange={(e) => updateEntry(idx, 'exitScore', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gt-primary/20 bg-white px-3 py-2 text-sm outline-none focus:border-gt-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-ink/60">课堂表现</label>
                    <div className="mt-1 flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => updateEntry(idx, 'performance', star)}
                          className={`h-9 w-9 rounded-lg text-lg transition ${
                            entry.performance >= star
                              ? 'bg-gt-gold/20 text-gt-gold'
                              : 'bg-slate-100 text-slate-300 hover:bg-gt-gold/10'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <input type="hidden" name={`students[${idx}].performance`} value={entry.performance || ''} />
                  </div>
                  <div>
                    <label className="text-xs text-ink/60">掌握度</label>
                    <div className="mt-1 flex gap-1">
                      {([
                        { value: 'mastered', label: '掌握', color: 'gt-green' },
                        { value: 'partial', label: '半懂', color: 'gt-gold' },
                        { value: 'weak', label: '不会', color: 'gt-red' }
                      ] as const).map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateEntry(idx, 'mastery', opt.value)}
                          className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${
                            entry.mastery === opt.value
                              ? `bg-${opt.color}/20 text-${opt.color} ring-1 ring-${opt.color}/30`
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <input type="hidden" name={`students[${idx}].mastery`} value={entry.mastery} />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-xs text-ink/60">评语（选填）</label>
                  <textarea
                    name={`students[${idx}].comment`}
                    rows={1}
                    value={entry.comment}
                    onChange={(e) => updateEntry(idx, 'comment', e.target.value)}
                    onFocus={(e) => { e.currentTarget.rows = 3; }}
                    onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.rows = 1; }}
                    className="mt-1 w-full rounded-lg border border-gt-primary/20 bg-white px-3 py-2 text-sm outline-none focus:border-gt-accent"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : selectedGroup ? (
          <p className="mt-6 rounded-xl border border-gt-primary/10 bg-white/80 p-6 text-center text-sm text-ink/50">
            该班组暂无在读学生
          </p>
        ) : null}

        {entries.length > 0 ? (
          <div className="mt-6">
            <button
              type="submit"
              className="w-full rounded-xl bg-gt-primary px-6 py-3 text-base font-medium text-white transition hover:bg-gt-primary/90"
            >
              保存全部记录
            </button>
          </div>
        ) : null}
      </form>
    </div>
  );
}
