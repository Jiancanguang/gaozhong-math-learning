'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';

import { GROWTH_V2_MASTERY_OPTIONS } from '@/lib/growth-v2';
import type { GrowthTagCatalogItem } from '@/lib/growth-v2-store';

export type GrowthV2ExamFormGroup = {
  id: string;
  name: string;
  gradeLabel: string;
};

export type GrowthV2ExamFormStudent = {
  id: string;
  name: string;
  gradeLabel: string;
  homeGroupId: string | null;
};

export type GrowthV2ExamFormInitialValues = {
  name?: string;
  examDate?: string;
  examType?: 'school' | 'internal' | 'other';
  subject?: string;
  totalScore?: string;
  notes?: string;
};

export type GrowthV2ExamFormInitialEntry = {
  studentId: string;
  score?: string;
  classRank?: string;
  gradeRank?: string;
  masteryLevel?: string;
  tagNames?: string;
  note?: string;
};

type ExamEntry = {
  id: string;
  name: string;
  gradeLabel: string;
  score: string;
  classRank: string;
  gradeRank: string;
  masteryLevel: string;
  tagNames: string;
  note: string;
};

type GrowthV2ExamBatchFormProps = {
  groups: GrowthV2ExamFormGroup[];
  students: GrowthV2ExamFormStudent[];
  tagCatalog: GrowthTagCatalogItem[];
  action: (formData: FormData) => void | Promise<void>;
  title?: string;
  description?: string;
  submitLabel?: string;
  initialGroupId?: string;
  initialValues?: GrowthV2ExamFormInitialValues;
  initialEntries?: GrowthV2ExamFormInitialEntry[];
};

function SubmitButton({ disabled, label }: { disabled?: boolean; label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? '保存中...' : label}
    </button>
  );
}

function createEntry(student: GrowthV2ExamFormStudent, initial?: GrowthV2ExamFormInitialEntry): ExamEntry {
  return {
    id: student.id,
    name: student.name,
    gradeLabel: student.gradeLabel,
    score: initial?.score ?? '',
    classRank: initial?.classRank ?? '',
    gradeRank: initial?.gradeRank ?? '',
    masteryLevel: initial?.masteryLevel ?? '',
    tagNames: initial?.tagNames ?? '',
    note: initial?.note ?? ''
  };
}

export function GrowthV2ExamBatchForm({
  groups,
  students,
  tagCatalog,
  action,
  title = '新建考试记录',
  description = '按班组批量录入成绩、排名、掌握度和薄弱点。没有分数的学生不会写入本次考试。',
  submitLabel = '保存本次考试',
  initialGroupId: providedInitialGroupId,
  initialValues,
  initialEntries = []
}: GrowthV2ExamBatchFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const initialGroupId = providedInitialGroupId ?? groups[0]?.id ?? '';
  const initialEntryMap = new Map(initialEntries.map((entry) => [entry.studentId, entry]));

  const buildEntriesForGroup = (groupId: string) =>
    {
      const residents = students
      .filter((student) => student.homeGroupId === groupId)
      .sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'))
      .map((student) => createEntry(student, initialEntryMap.get(student.id)));

      if (groupId !== initialGroupId) {
        return residents;
      }

      const extraInitialEntries = initialEntries
        .filter((entry) => !residents.some((resident) => resident.id === entry.studentId))
        .map((entry) => {
          const student = students.find((item) => item.id === entry.studentId);
          if (!student) return null;
          return createEntry(student, entry);
        })
        .filter((entry): entry is ExamEntry => Boolean(entry));

      return [...residents, ...extraInitialEntries];
    };

  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId);
  const [entries, setEntries] = useState<ExamEntry[]>(() => buildEntriesForGroup(initialGroupId));
  const [focusedEntryId, setFocusedEntryId] = useState<string | null>(null);

  const currentGroup = groups.find((group) => group.id === selectedGroupId) ?? null;
  const groupedTags = tagCatalog.reduce<Record<string, GrowthTagCatalogItem[]>>((accumulator, item) => {
    if (!accumulator[item.category]) {
      accumulator[item.category] = [];
    }
    accumulator[item.category].push(item);
    return accumulator;
  }, {});

  function handleGroupChange(groupId: string) {
    setSelectedGroupId(groupId);
    setEntries(buildEntriesForGroup(groupId));
    setFocusedEntryId(null);
  }

  function updateEntry(index: number, field: keyof ExamEntry, value: string) {
    setEntries((previous) => {
      const next = [...previous];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function appendTagToFocusedEntry(tagName: string) {
    if (!focusedEntryId) return;

    setEntries((previous) =>
      previous.map((entry) => {
        if (entry.id !== focusedEntryId) return entry;

        const currentTags = entry.tagNames
          .split(/[\n,，、]+/)
          .map((tag) => tag.trim())
          .filter(Boolean);

        if (currentTags.includes(tagName)) {
          return entry;
        }

        return {
          ...entry,
          tagNames: [...currentTags, tagName].join('，')
        };
      })
    );
  }

  return (
    <form action={action} className="space-y-6">
      <section className="rounded-2xl border border-border-light bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-ink">{title}</h2>
            <p className="mt-2 text-sm text-ink/70">{description}</p>
          </div>
          <p className="text-sm text-ink/60">{currentGroup ? `${currentGroup.name} · ${entries.length} 人在表单中` : '先选择班组'}</p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <label className="text-sm text-ink/80">
            <span className="font-medium">班组</span>
            <select
              name="groupId"
              value={selectedGroupId}
              onChange={(event) => handleGroupChange(event.target.value)}
              className="mt-1 w-full rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="">请选择班组</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-ink/80">
            <span className="font-medium">考试名称</span>
            <input
              name="name"
              type="text"
              defaultValue={initialValues?.name ?? ''}
              placeholder="例如：3 月月考"
              className="mt-1 w-full rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="text-sm text-ink/80">
            <span className="font-medium">考试日期</span>
            <input
              name="examDate"
              type="date"
              defaultValue={initialValues?.examDate ?? today}
              className="mt-1 w-full rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="text-sm text-ink/80">
            <span className="font-medium">考试类型</span>
            <select
              name="examType"
              defaultValue={initialValues?.examType ?? 'internal'}
              className="mt-1 w-full rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="internal">工作室测验</option>
              <option value="school">学校考试</option>
              <option value="other">其他</option>
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-sm text-ink/80">
            <span className="font-medium">科目</span>
            <input
              name="subject"
              type="text"
              defaultValue={initialValues?.subject ?? '数学'}
              className="mt-1 w-full rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="text-sm text-ink/80">
            <span className="font-medium">满分</span>
            <input
              name="totalScore"
              type="number"
              min="0"
              step="0.1"
              defaultValue={initialValues?.totalScore ?? ''}
              placeholder="例如：150"
              className="mt-1 w-full rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="text-sm text-ink/80">
            <span className="font-medium">考试备注</span>
            <input
              name="notes"
              type="text"
              defaultValue={initialValues?.notes ?? ''}
              placeholder="例如：压轴题偏难"
              className="mt-1 w-full rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border-light bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-ink">薄弱点快捷标签</h2>
            <p className="mt-2 text-sm text-ink/70">先点中某个学生的“薄弱点”输入框，再点下面的标签即可自动追加。</p>
          </div>
          <p className="text-sm text-ink/60">{focusedEntryId ? `当前焦点：${entries.find((entry) => entry.id === focusedEntryId)?.name ?? '已选择学生'}` : '当前没有聚焦学生'}</p>
        </div>

        <div className="mt-5 space-y-4">
          {Object.entries(groupedTags).map(([category, items]) => (
            <div key={category}>
              <p className="text-sm font-medium text-ink">{category}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => appendTagToFocusedEntry(item.tagName)}
                    disabled={!focusedEntryId}
                    className="rounded-full border border-border-default bg-surface-alt px-3 py-1 text-xs font-medium text-tide transition hover:bg-tide/5 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {item.tagName}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border-light bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-ink">学生成绩录入</h2>
            <p className="mt-2 text-sm text-ink/70">默认按所选班组加载常驻学生。只有填写了分数的学生才会生成考试记录。</p>
          </div>
          <p className="text-sm text-ink/60">当前 {entries.length} 名学生</p>
        </div>

        {entries.length > 0 ? (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border-light bg-surface">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-light bg-surface-alt text-left text-ink/70">
                  <th className="px-4 py-3 font-medium">学生</th>
                  <th className="px-4 py-3 font-medium">分数</th>
                  <th className="px-4 py-3 font-medium">班排</th>
                  <th className="px-4 py-3 font-medium">年排</th>
                  <th className="px-4 py-3 font-medium">掌握度</th>
                  <th className="px-4 py-3 font-medium">薄弱点</th>
                  <th className="px-4 py-3 font-medium">备注</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={entry.id} className="border-b border-border-light align-top last:border-b-0">
                    <td className="px-4 py-4">
                      <input type="hidden" name={`students[${index}].id`} value={entry.id} />
                      <p className="font-medium text-ink">{entry.name}</p>
                      <p className="mt-1 text-xs text-ink/55">{entry.gradeLabel || '未填年级'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <input
                        name={`students[${index}].score`}
                        type="number"
                        step="0.1"
                        min="0"
                        value={entry.score}
                        onChange={(event) => updateEntry(index, 'score', event.target.value)}
                        className="w-24 rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        name={`students[${index}].classRank`}
                        type="number"
                        step="1"
                        min="1"
                        value={entry.classRank}
                        onChange={(event) => updateEntry(index, 'classRank', event.target.value)}
                        className="w-24 rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        name={`students[${index}].gradeRank`}
                        type="number"
                        step="1"
                        min="1"
                        value={entry.gradeRank}
                        onChange={(event) => updateEntry(index, 'gradeRank', event.target.value)}
                        className="w-24 rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <select
                        name={`students[${index}].masteryLevel`}
                        value={entry.masteryLevel}
                        onChange={(event) => updateEntry(index, 'masteryLevel', event.target.value)}
                        className="w-32 rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                      >
                        <option value="">未填</option>
                        {GROWTH_V2_MASTERY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <input
                        name={`students[${index}].tagNames`}
                        type="text"
                        value={entry.tagNames}
                        onFocus={() => setFocusedEntryId(entry.id)}
                        onChange={(event) => updateEntry(index, 'tagNames', event.target.value)}
                        placeholder="逗号分隔，例如 计算错误，导数运算"
                        className="w-64 rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <textarea
                        name={`students[${index}].note`}
                        rows={2}
                        value={entry.note}
                        onChange={(event) => updateEntry(index, 'note', event.target.value)}
                        placeholder="例如：选择题稳定，大题导数第二问失分"
                        className="min-h-[64px] w-56 rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-border-default bg-surface-alt p-8 text-center text-sm text-ink/60">
            请选择一个班组开始录入。
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink/60">提示：没有分数的学生不会写入本次考试。</p>
          <SubmitButton disabled={!selectedGroupId} label={submitLabel} />
        </div>
      </section>
    </form>
  );
}
