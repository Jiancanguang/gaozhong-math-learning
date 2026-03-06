'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';

import { GROWTH_V2_MASTERY_OPTIONS } from '@/lib/growth-v2';

export type GrowthV2LessonFormGroup = {
  id: string;
  name: string;
  gradeLabel: string;
};

export type GrowthV2LessonFormStudent = {
  id: string;
  name: string;
  gradeLabel: string;
  homeGroupId: string | null;
  homeGroupName: string | null;
};

type LessonEntry = {
  id: string;
  name: string;
  gradeLabel: string;
  homeGroupName: string | null;
  isGuest: boolean;
  entryScore: string;
  exitScore: string;
  performance: string;
  masteryLevel: string;
  comment: string;
};

type GrowthV2LessonBatchFormProps = {
  groups: GrowthV2LessonFormGroup[];
  students: GrowthV2LessonFormStudent[];
  action: (formData: FormData) => void | Promise<void>;
};

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? '保存中...' : '保存本节课记录'}
    </button>
  );
}

function createEntry(student: GrowthV2LessonFormStudent, isGuest: boolean): LessonEntry {
  return {
    id: student.id,
    name: student.name,
    gradeLabel: student.gradeLabel,
    homeGroupName: student.homeGroupName,
    isGuest,
    entryScore: '',
    exitScore: '',
    performance: '',
    masteryLevel: '',
    comment: ''
  };
}

export function GrowthV2LessonBatchForm({ groups, students, action }: GrowthV2LessonBatchFormProps) {
  const initialGroupId = groups[0]?.id ?? '';
  const residentEntriesFor = (groupId: string) =>
    students
      .filter((student) => student.homeGroupId === groupId)
      .sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'))
      .map((student) => createEntry(student, false));

  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId);
  const [entries, setEntries] = useState<LessonEntry[]>(() => residentEntriesFor(initialGroupId));
  const [guestStudentId, setGuestStudentId] = useState('');
  const today = new Date().toISOString().slice(0, 10);

  const currentGroup = groups.find((group) => group.id === selectedGroupId) ?? null;
  const availableGuestStudents = students
    .filter((student) => student.homeGroupId !== selectedGroupId && !entries.some((entry) => entry.id === student.id))
    .sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'));

  function handleGroupChange(groupId: string) {
    setSelectedGroupId(groupId);
    setEntries(residentEntriesFor(groupId));
    setGuestStudentId('');
  }

  function updateEntry(index: number, field: keyof LessonEntry, value: string) {
    setEntries((previous) => {
      const next = [...previous];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addGuestStudent() {
    if (!guestStudentId) return;
    const student = students.find((item) => item.id === guestStudentId);
    if (!student) return;

    setEntries((previous) => [...previous, createEntry(student, true)]);
    setGuestStudentId('');
  }

  function removeGuestStudent(studentId: string) {
    setEntries((previous) => previous.filter((entry) => !(entry.isGuest && entry.id === studentId)));
  }

  return (
    <form action={action} className="space-y-6">
      <section className="rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-tide">新建课堂记录</h2>
            <p className="mt-2 text-sm text-ink/70">先选班组，再按学生逐条填写。留空的学生不会生成课堂记录。</p>
          </div>
          <p className="text-sm text-ink/60">{currentGroup ? `${currentGroup.name} · ${entries.length} 人在表单中` : '先选择班组'}</p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="text-sm text-ink/80">
            <span className="font-medium">班组</span>
            <select
              name="groupId"
              value={selectedGroupId}
              onChange={(event) => handleGroupChange(event.target.value)}
              className="mt-1 w-full rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
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
            <span className="font-medium">上课日期</span>
            <input
              name="lessonDate"
              type="date"
              defaultValue={today}
              className="mt-1 w-full rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="text-sm text-ink/80">
            <span className="font-medium">课堂主题</span>
            <input
              name="topic"
              type="text"
              placeholder="例如：导数单调性与极值"
              className="mt-1 w-full rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <label className="text-sm text-ink/80">
            <span className="font-medium">开始时间</span>
            <input
              name="timeStart"
              type="time"
              className="mt-1 w-full rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="text-sm text-ink/80">
            <span className="font-medium">结束时间</span>
            <input
              name="timeEnd"
              type="time"
              className="mt-1 w-full rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="text-sm text-ink/80">
            <span className="font-medium">进门考内容</span>
            <input
              name="entryTestTopic"
              type="text"
              placeholder="例如：上节课复习"
              className="mt-1 w-full rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="text-sm text-ink/80">
            <span className="font-medium">课后测内容</span>
            <input
              name="exitTestTopic"
              type="text"
              placeholder="例如：当堂巩固"
              className="mt-1 w-full rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-sm text-ink/80">
            <span className="font-medium">测试满分</span>
            <input
              name="testTotal"
              type="number"
              min="0"
              step="0.1"
              placeholder="例如：50"
              className="mt-1 w-full rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="text-sm text-ink/80 md:col-span-2">
            <span className="font-medium">作业安排</span>
            <input
              name="homework"
              type="text"
              placeholder="例如：课本 112 页第 3、5、8 题"
              className="mt-1 w-full rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-ink/80">
            <span className="font-medium">课堂要点</span>
            <textarea
              name="keyPoints"
              rows={4}
              placeholder="记录本节课覆盖的方法、题型和注意点"
              className="mt-1 w-full rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="text-sm text-ink/80">
            <span className="font-medium">老师备注</span>
            <textarea
              name="notes"
              rows={4}
              placeholder="记录课堂节奏、共性问题或家长需要知道的信息"
              className="mt-1 w-full rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-tide">学生录入</h2>
            <p className="mt-2 text-sm text-ink/70">本班学生默认全部列出，调课学生可以从下面追加。没有数据的学生会被视为本节未录入。</p>
          </div>
          <p className="text-sm text-ink/60">常驻 {entries.filter((entry) => !entry.isGuest).length} 人 · 调课 {entries.filter((entry) => entry.isGuest).length} 人</p>
        </div>

        {selectedGroupId ? (
          <div className="mt-5 rounded-2xl border border-dashed border-tide/20 bg-paper/40 p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <label className="text-sm text-ink/80">
                <span className="font-medium">追加调课学生</span>
                <select
                  value={guestStudentId}
                  onChange={(event) => setGuestStudentId(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                >
                  <option value="">请选择其他班组学生</option>
                  {availableGuestStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} · {student.homeGroupName ?? '未分组'} · {student.gradeLabel || '未填年级'}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={addGuestStudent}
                disabled={!guestStudentId}
                className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                加入调课名单
              </button>
            </div>
          </div>
        ) : null}

        {entries.length > 0 ? (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-tide/10 bg-white">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-tide/10 bg-paper/60 text-left text-ink/70">
                  <th className="px-4 py-3 font-medium">学生</th>
                  <th className="px-4 py-3 font-medium">身份</th>
                  <th className="px-4 py-3 font-medium">进门考</th>
                  <th className="px-4 py-3 font-medium">课后测</th>
                  <th className="px-4 py-3 font-medium">课堂表现</th>
                  <th className="px-4 py-3 font-medium">掌握度</th>
                  <th className="px-4 py-3 font-medium">评语</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={`${entry.id}-${entry.isGuest ? 'guest' : 'home'}`} className="border-b border-tide/10 align-top last:border-b-0">
                    <td className="px-4 py-4">
                      <input type="hidden" name={`students[${index}].id`} value={entry.id} />
                      <input type="hidden" name={`students[${index}].isGuest`} value={entry.isGuest ? 'true' : 'false'} />
                      <p className="font-medium text-tide">{entry.name}</p>
                      <p className="mt-1 text-xs text-ink/55">
                        {entry.gradeLabel || '未填年级'}
                        {entry.homeGroupName ? ` · ${entry.homeGroupName}` : ''}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          entry.isGuest ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                        }`}
                      >
                        {entry.isGuest ? '调课' : '常驻'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <input
                        name={`students[${index}].entryScore`}
                        type="number"
                        step="0.1"
                        min="0"
                        value={entry.entryScore}
                        onChange={(event) => updateEntry(index, 'entryScore', event.target.value)}
                        className="w-24 rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        name={`students[${index}].exitScore`}
                        type="number"
                        step="0.1"
                        min="0"
                        value={entry.exitScore}
                        onChange={(event) => updateEntry(index, 'exitScore', event.target.value)}
                        className="w-24 rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <select
                        name={`students[${index}].performance`}
                        value={entry.performance}
                        onChange={(event) => updateEntry(index, 'performance', event.target.value)}
                        className="w-28 rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                      >
                        <option value="">未填</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        name={`students[${index}].masteryLevel`}
                        value={entry.masteryLevel}
                        onChange={(event) => updateEntry(index, 'masteryLevel', event.target.value)}
                        className="w-32 rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
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
                      <textarea
                        name={`students[${index}].comment`}
                        rows={2}
                        value={entry.comment}
                        onChange={(event) => updateEntry(index, 'comment', event.target.value)}
                        placeholder="例如：公式会背，但二问转化慢"
                        className="min-h-[64px] w-56 rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                      />
                    </td>
                    <td className="px-4 py-4">
                      {entry.isGuest ? (
                        <button
                          type="button"
                          onClick={() => removeGuestStudent(entry.id)}
                          className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                        >
                          移除
                        </button>
                      ) : (
                        <span className="text-xs text-ink/45">常驻学生</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-tide/20 bg-paper/40 p-8 text-center text-sm text-ink/60">
            请选择一个班组开始录入。
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink/60">提示：学生行全部留空时，不会写入该生本节课数据。</p>
          <SubmitButton disabled={!selectedGroupId} />
        </div>
      </section>
    </form>
  );
}
