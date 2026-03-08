'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { PetClass, PetStudent, PetHistory } from '@/lib/pet-store';
import { PET_TYPES, getLevelLabel, getLevelProgress, getPetType } from '@/lib/pet';
import {
  addStudentsAction,
  batchFeedAction,
  deleteStudentAction,
  scoreStudentAction,
  updateClassSettingsAction
} from '@/app/admin/pet/actions';

type Props = {
  petClass: PetClass;
  students: PetStudent[];
  history: PetHistory[];
  initialTab?: string;
};

type Tab = 'students' | 'feed' | 'settings' | 'history';

export function PetClassManager({ petClass, students, history, initialTab }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>((initialTab as Tab) || 'students');
  const [feedAmount, setFeedAmount] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const tabs: { id: Tab; label: string }[] = [
    { id: 'students', label: `学生 (${students.length})` },
    { id: 'feed', label: '喂养' },
    { id: 'settings', label: '设置' },
    { id: 'history', label: '记录' }
  ];

  function toggleAll() {
    if (selectedIds.size === students.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(students.map((s) => s.id)));
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  async function handleBatchFeed() {
    if (selectedIds.size === 0) return;
    const entries = Array.from(selectedIds).map((studentId) => ({ studentId, amount: feedAmount }));
    const formData = new FormData();
    formData.set('classId', petClass.id);
    formData.set('entries', JSON.stringify(entries));
    await batchFeedAction(formData);
    setSelectedIds(new Set());
    router.refresh();
  }

  async function handleScore(studentId: string, amount: number, note: string) {
    const formData = new FormData();
    formData.set('classId', petClass.id);
    formData.set('studentId', studentId);
    formData.set('amount', String(amount));
    formData.set('note', note);
    await scoreStudentAction(formData);
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">{petClass.name}</h1>

      {/* Tab bar */}
      <div className="mt-4 flex gap-1 border-b border-border-light">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative px-4 py-3 text-sm font-medium transition ${
              tab === t.id ? 'text-tide' : 'text-ink/40 hover:text-tide'
            }`}
          >
            {t.label}
            {tab === t.id && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-tide" />}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'students' && <StudentsTab classId={petClass.id} students={students} thresholds={petClass.levelThresholds} />}
        {tab === 'feed' && (
          <FeedTab
            students={students}
            feedAmount={feedAmount}
            setFeedAmount={setFeedAmount}
            selectedIds={selectedIds}
            toggleAll={toggleAll}
            toggleOne={toggleOne}
            onFeed={handleBatchFeed}
            onScore={handleScore}
            scoringRules={petClass.scoringRules}
            thresholds={petClass.levelThresholds}
          />
        )}
        {tab === 'settings' && <SettingsTab petClass={petClass} />}
        {tab === 'history' && <HistoryTab history={history} students={students} />}
      </div>
    </div>
  );
}

// ─── Students Tab ───────────────────────────────────────
function StudentsTab({ classId, students, thresholds }: { classId: string; students: PetStudent[]; thresholds: number[] }) {
  const router = useRouter();
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="space-y-6">
      {/* Add students */}
      <form
        action={async (formData) => {
          await addStudentsAction(formData);
          router.refresh();
        }}
        className="rounded-xl border border-tide/10 bg-white/80 p-4"
      >
        <h3 className="font-semibold text-ink">批量添加学生</h3>
        <p className="mt-1 text-xs text-ink/50">每行一个学生姓名，也可以用逗号分隔</p>
        <input type="hidden" name="classId" value={classId} />
        <textarea
          name="names"
          rows={3}
          required
          placeholder="张三&#10;李四&#10;王五"
          className="mt-2 w-full rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none transition focus:border-tide"
        />
        <button type="submit" className="mt-2 rounded-lg bg-tide px-4 py-2 text-sm font-medium text-white transition hover:bg-tide/90">
          添加
        </button>
      </form>

      {/* Student list */}
      {students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-tide/20 p-8 text-center text-sm text-ink/40">还没有学生</div>
      ) : (
        <div className="space-y-2">
          {students.map((s) => {
            const pet = s.petType ? getPetType(s.petType) : null;
            const progress = getLevelProgress(s.foodCount, s.level, thresholds);
            return (
              <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-tide/10 bg-white/80 px-4 py-3">
                <span className="text-2xl">{pet?.emoji ?? '🥚'}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">{s.name}</span>
                    <span className="rounded bg-tide/10 px-1.5 py-0.5 text-xs font-medium text-tide">
                      Lv.{s.level} {getLevelLabel(s.level)}
                    </span>
                    {s.badgeCount > 0 && <span className="text-xs text-amber-500">{s.badgeCount} 枚徽章</span>}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-tide/10">
                      <div className="h-full rounded-full bg-tide transition-all" style={{ width: `${progress.percent}%` }} />
                    </div>
                    <span className="text-xs text-ink/40">
                      {s.foodCount}/{progress.next}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink/30">积分: {s.score}</span>
                  <button
                    onClick={() => {
                      const url = `${siteUrl}/pet/${s.accessToken}`;
                      navigator.clipboard.writeText(url);
                      alert('已复制学生链接');
                    }}
                    className="rounded bg-tide/10 px-2 py-1 text-xs text-tide transition hover:bg-tide/20"
                  >
                    复制链接
                  </button>
                  <form
                    action={async (formData) => {
                      await deleteStudentAction(formData);
                      router.refresh();
                    }}
                  >
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="classId" value={classId} />
                    <button
                      type="submit"
                      className="text-xs text-ink/30 transition hover:text-[#e05555]"
                      onClick={(e) => {
                        if (!confirm(`确定删除 ${s.name}？`)) e.preventDefault();
                      }}
                    >
                      删除
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Feed Tab ───────────────────────────────────────────
function FeedTab({
  students,
  feedAmount,
  setFeedAmount,
  selectedIds,
  toggleAll,
  toggleOne,
  onFeed,
  onScore,
  scoringRules,
  thresholds
}: {
  students: PetStudent[];
  feedAmount: number;
  setFeedAmount: (n: number) => void;
  selectedIds: Set<string>;
  toggleAll: () => void;
  toggleOne: (id: string) => void;
  onFeed: () => void;
  onScore: (studentId: string, amount: number, note: string) => void;
  scoringRules: { label: string; value: number }[];
  thresholds: number[];
}) {
  return (
    <div className="space-y-6">
      {/* Batch feed controls */}
      <div className="rounded-xl border border-tide/10 bg-white/80 p-4">
        <h3 className="font-semibold text-ink">批量喂养</h3>
        <p className="mt-1 text-xs text-ink/50">勾选学生，统一投喂食物</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="text-sm text-ink/70">每人投喂:</label>
          <input
            type="number"
            min={1}
            max={50}
            value={feedAmount}
            onChange={(e) => setFeedAmount(Math.max(1, Number(e.target.value)))}
            className="w-20 rounded-lg border border-border-default bg-white px-2 py-1.5 text-center text-sm outline-none focus:border-tide"
          />
          <span className="text-sm text-ink/50">份食物</span>
          <button onClick={toggleAll} className="rounded-lg border border-tide/20 px-3 py-1.5 text-sm text-tide transition hover:bg-tide/5">
            {selectedIds.size === students.length ? '取消全选' : '全选'}
          </button>
          <button
            onClick={onFeed}
            disabled={selectedIds.size === 0}
            className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white transition hover:bg-accent/90 disabled:opacity-40"
          >
            喂养 {selectedIds.size} 人
          </button>
        </div>
      </div>

      {/* Student list with checkboxes */}
      <div className="space-y-2">
        {students.map((s) => {
          const pet = s.petType ? getPetType(s.petType) : null;
          const progress = getLevelProgress(s.foodCount, s.level, thresholds);
          return (
            <div key={s.id} className="flex items-center gap-3 rounded-xl border border-tide/10 bg-white/80 px-4 py-3">
              <input
                type="checkbox"
                checked={selectedIds.has(s.id)}
                onChange={() => toggleOne(s.id)}
                className="h-4 w-4 rounded border-border-default text-tide accent-tide"
              />
              <span className="text-xl">{pet?.emoji ?? '🥚'}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink">{s.name}</span>
                  <span className="text-xs text-ink/40">
                    Lv.{s.level} · {s.foodCount}/{progress.next} · 积分 {s.score}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-tide/10">
                  <div className="h-full rounded-full bg-tide transition-all" style={{ width: `${progress.percent}%` }} />
                </div>
              </div>
              {/* Quick scoring buttons */}
              {scoringRules.length > 0 && (
                <div className="flex gap-1">
                  {scoringRules.map((rule) => (
                    <button
                      key={rule.label}
                      onClick={() => onScore(s.id, rule.value, rule.label)}
                      className={`rounded px-2 py-1 text-xs font-medium transition ${
                        rule.value > 0
                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                      }`}
                    >
                      {rule.label} {rule.value > 0 ? `+${rule.value}` : rule.value}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Settings Tab ───────────────────────────────────────
function SettingsTab({ petClass }: { petClass: PetClass }) {
  const router = useRouter();
  const [thresholds, setThresholds] = useState(petClass.levelThresholds.join(', '));
  const [rules, setRules] = useState(JSON.stringify(petClass.scoringRules, null, 2));
  const [items, setItems] = useState(JSON.stringify(petClass.shopItems, null, 2));

  return (
    <form
      action={async (formData) => {
        await updateClassSettingsAction(formData);
        router.refresh();
      }}
      className="space-y-6"
    >
      <input type="hidden" name="id" value={petClass.id} />

      <div className="rounded-xl border border-tide/10 bg-white/80 p-4">
        <h3 className="font-semibold text-ink">班级名称</h3>
        <input
          type="text"
          name="name"
          defaultValue={petClass.name}
          className="mt-2 w-full rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none focus:border-tide"
        />
      </div>

      <div className="rounded-xl border border-tide/10 bg-white/80 p-4">
        <h3 className="font-semibold text-ink">等级配置</h3>
        <p className="mt-1 text-xs text-ink/50">10个等级分别需要的累计食物数，逗号分隔。如：0, 5, 12, 20, 30, 40, 52, 65, 80, 100</p>
        <input
          type="text"
          value={thresholds}
          onChange={(e) => setThresholds(e.target.value)}
          className="mt-2 w-full rounded-lg border border-border-default bg-white px-3 py-2 text-sm font-mono outline-none focus:border-tide"
        />
        <input type="hidden" name="thresholds" value={JSON.stringify(thresholds.split(',').map((s) => Number(s.trim())))} />
      </div>

      <div className="rounded-xl border border-tide/10 bg-white/80 p-4">
        <h3 className="font-semibold text-ink">积分规则（快捷按钮）</h3>
        <p className="mt-1 text-xs text-ink/50">
          JSON 格式，如：[{`{"label":"表现好","value":2}`}, {`{"label":"迟到","value":-1}`}]
        </p>
        <textarea
          rows={4}
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          className="mt-2 w-full rounded-lg border border-border-default bg-white px-3 py-2 font-mono text-sm outline-none focus:border-tide"
        />
        <input type="hidden" name="scoringRules" value={rules} />
      </div>

      <div className="rounded-xl border border-tide/10 bg-white/80 p-4">
        <h3 className="font-semibold text-ink">小卖部商品</h3>
        <p className="mt-1 text-xs text-ink/50">
          JSON 格式，如：[{`{"name":"铅笔","cost":1,"stock":10}`}]
        </p>
        <textarea
          rows={4}
          value={items}
          onChange={(e) => setItems(e.target.value)}
          className="mt-2 w-full rounded-lg border border-border-default bg-white px-3 py-2 font-mono text-sm outline-none focus:border-tide"
        />
        <input type="hidden" name="shopItems" value={items} />
      </div>

      <button type="submit" className="rounded-lg bg-tide px-5 py-2 text-sm font-medium text-white transition hover:bg-tide/90">
        保存设置
      </button>
    </form>
  );
}

// ─── History Tab ────────────────────────────────────────
function HistoryTab({ history, students }: { history: PetHistory[]; students: PetStudent[] }) {
  const studentMap = new Map(students.map((s) => [s.id, s]));

  const actionLabels: Record<string, string> = {
    feed: '喂养',
    score: '积分',
    graduate: '毕业',
    exchange: '兑换'
  };

  const actionColors: Record<string, string> = {
    feed: 'text-emerald-600 bg-emerald-50',
    score: 'text-blue-600 bg-blue-50',
    graduate: 'text-amber-600 bg-amber-50',
    exchange: 'text-purple-600 bg-purple-50'
  };

  return (
    <div className="space-y-2">
      {history.length === 0 ? (
        <div className="rounded-xl border border-dashed border-tide/20 p-8 text-center text-sm text-ink/40">暂无操作记录</div>
      ) : (
        history.map((h) => {
          const student = studentMap.get(h.studentId);
          return (
            <div key={h.id} className="flex items-center gap-3 rounded-lg border border-tide/10 bg-white/80 px-4 py-2 text-sm">
              <span className={`rounded px-2 py-0.5 text-xs font-medium ${actionColors[h.action] ?? 'bg-ink/5 text-ink/50'}`}>
                {actionLabels[h.action] ?? h.action}
              </span>
              <span className="font-medium text-ink">{student?.name ?? '未知'}</span>
              <span className="text-ink/50">{h.note}</span>
              <span className="ml-auto text-xs text-ink/30">{new Date(h.createdAt).toLocaleString('zh-CN')}</span>
            </div>
          );
        })
      )}
    </div>
  );
}
