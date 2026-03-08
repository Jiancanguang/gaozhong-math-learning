'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { PetClass, PetHistory, PetStudent } from '@/lib/pet-store';
import { PET_TYPES, MAX_LEVEL, getLevelLabel, getLevelProgress, getPetType } from '@/lib/pet';
import { choosePetAction, exchangeAction, graduateAction } from '@/app/pet/actions';

type Props = {
  student: PetStudent;
  petClass: PetClass;
  history: PetHistory[];
  token: string;
};

type Tab = 'pet' | 'shop' | 'history';

export function StudentPetView({ student, petClass, history, token }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('pet');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'pet', label: '我的宠物' },
    { id: 'shop', label: '小卖部' },
    { id: 'history', label: '成长记录' }
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-tide/10 bg-white/85 p-5 text-center">
        <p className="text-sm text-ink/50">{petClass.name}</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">{student.name} 的宠物小屋</h1>
        <div className="mt-2 flex justify-center gap-3 text-sm text-ink/50">
          <span>积分: {student.score}</span>
          <span>徽章: {student.badgeCount} 枚</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex justify-center gap-1 border-b border-border-light">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative px-5 py-3 text-sm font-medium transition ${
              tab === t.id ? 'text-tide' : 'text-ink/40 hover:text-tide'
            }`}
          >
            {t.label}
            {tab === t.id && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-tide" />}
          </button>
        ))}
      </div>

      {tab === 'pet' && <PetTab student={student} petClass={petClass} token={token} router={router} />}
      {tab === 'shop' && <ShopTab student={student} petClass={petClass} token={token} router={router} />}
      {tab === 'history' && <HistoryTabContent history={history} />}
    </div>
  );
}

// ─── Pet Tab ────────────────────────────────────────────
function PetTab({
  student,
  petClass,
  token,
  router
}: {
  student: PetStudent;
  petClass: PetClass;
  token: string;
  router: ReturnType<typeof useRouter>;
}) {
  // No pet chosen yet — show selection
  if (!student.petType) {
    return (
      <div className="rounded-2xl border border-tide/10 bg-white/85 p-6">
        <h2 className="text-center text-xl font-semibold text-tide">选择你的守护神兽</h2>
        <p className="mt-1 text-center text-sm text-ink/50">选择一只可爱的神兽，它会陪伴你的学习之旅</p>
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {PET_TYPES.map((pet) => (
            <form
              key={pet.id}
              action={async (formData) => {
                await choosePetAction(formData);
                router.refresh();
              }}
            >
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="petType" value={pet.id} />
              <button
                type="submit"
                className="flex w-full flex-col items-center rounded-xl border-2 border-tide/10 bg-paper/50 px-3 py-4 transition hover:border-tide hover:shadow-md active:scale-95"
              >
                <span className="text-4xl">{pet.emoji}</span>
                <span className="mt-2 text-sm font-medium text-ink">{pet.name}</span>
              </button>
            </form>
          ))}
        </div>
      </div>
    );
  }

  // Pet chosen — show progress
  const pet = getPetType(student.petType);
  const progress = getLevelProgress(student.foodCount, student.level, petClass.levelThresholds);
  const isMaxLevel = student.level >= MAX_LEVEL;

  return (
    <div className="space-y-4">
      {/* Pet display */}
      <div className="rounded-2xl border border-tide/10 bg-white/85 p-6 text-center">
        <div className="text-7xl">{pet?.emoji ?? '🥚'}</div>
        <h2 className="mt-3 text-xl font-bold text-ink">{pet?.name ?? '未知'}</h2>
        <div className="mt-1 flex justify-center gap-2">
          <span className="rounded-full bg-tide/10 px-3 py-1 text-sm font-semibold text-tide">
            Lv.{student.level} {getLevelLabel(student.level)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mx-auto mt-4 max-w-xs">
          {isMaxLevel ? (
            <div className="text-center">
              <p className="text-sm font-medium text-amber-500">已达最高等级！可以收获徽章啦</p>
              <form
                action={async (formData) => {
                  await graduateAction(formData);
                  router.refresh();
                }}
                className="mt-3"
              >
                <input type="hidden" name="token" value={token} />
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-medium text-white transition hover:bg-amber-600 active:scale-95"
                >
                  收获徽章
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-ink/50">
                <span>
                  {student.foodCount} / {progress.next} 食物
                </span>
                <span>{progress.percent}%</span>
              </div>
              <div className="mt-1 h-3 overflow-hidden rounded-full bg-tide/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-tide to-sky transition-all duration-500"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-ink/40">
                再吃 {progress.next - student.foodCount} 份食物升到 Lv.{student.level + 1}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Badge wall */}
      {student.badgeCount > 0 && (
        <div className="rounded-2xl border border-tide/10 bg-white/85 p-5">
          <h3 className="text-center font-semibold text-ink">我的徽章墙</h3>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {Array.from({ length: student.badgeCount }).map((_, i) => (
              <div key={i} className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-2xl shadow-sm">
                🏅
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Level progress overview */}
      <div className="rounded-2xl border border-tide/10 bg-white/85 p-5">
        <h3 className="font-semibold text-ink">成长路线</h3>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {petClass.levelThresholds.map((threshold, i) => {
            const level = i + 1;
            const reached = student.level >= level;
            return (
              <div
                key={level}
                className={`rounded-lg px-2 py-2 text-center text-xs ${
                  reached ? 'bg-tide/10 font-medium text-tide' : 'bg-ink/5 text-ink/30'
                }`}
              >
                <div>Lv.{level}</div>
                <div>{getLevelLabel(level)}</div>
                <div className="text-[10px]">{threshold}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Shop Tab ───────────────────────────────────────────
function ShopTab({
  student,
  petClass,
  token,
  router
}: {
  student: PetStudent;
  petClass: PetClass;
  token: string;
  router: ReturnType<typeof useRouter>;
}) {
  if (petClass.shopItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-tide/20 p-10 text-center">
        <p className="text-lg text-ink/40">老师还没有上架任何奖品</p>
        <p className="mt-1 text-sm text-ink/30">先努力升级宠物收集徽章吧</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-ink/50">可用徽章: {student.badgeCount} 枚</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {petClass.shopItems.map((item) => {
          const canAfford = student.badgeCount >= item.cost;
          return (
            <div key={item.name} className="rounded-xl border border-tide/10 bg-white/80 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">{item.name}</span>
                <span className="text-sm text-amber-500">{item.cost} 枚徽章</span>
              </div>
              {item.stock > 0 && <p className="mt-1 text-xs text-ink/40">库存: {item.stock}</p>}
              <form
                action={async (formData) => {
                  if (!confirm(`确定用 ${item.cost} 枚徽章兑换「${item.name}」吗？`)) return;
                  await exchangeAction(formData);
                  router.refresh();
                }}
                className="mt-2"
              >
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="itemName" value={item.name} />
                <input type="hidden" name="cost" value={String(item.cost)} />
                <button
                  type="submit"
                  disabled={!canAfford}
                  className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white transition hover:bg-accent/90 disabled:opacity-40"
                >
                  {canAfford ? '兑换' : '徽章不足'}
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── History Tab ────────────────────────────────────────
function HistoryTabContent({ history }: { history: PetHistory[] }) {
  const actionLabels: Record<string, string> = {
    feed: '喂养',
    score: '积分',
    graduate: '毕业',
    exchange: '兑换'
  };

  const actionEmojis: Record<string, string> = {
    feed: '🍖',
    score: '⭐',
    graduate: '🎓',
    exchange: '🎁'
  };

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-tide/20 p-8 text-center text-sm text-ink/40">还没有成长记录</div>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((h) => (
        <div key={h.id} className="flex items-center gap-3 rounded-lg border border-tide/10 bg-white/80 px-4 py-2 text-sm">
          <span className="text-lg">{actionEmojis[h.action] ?? '📝'}</span>
          <span className="font-medium text-ink">{actionLabels[h.action] ?? h.action}</span>
          <span className="text-ink/50">{h.note}</span>
          <span className="ml-auto text-xs text-ink/30">{new Date(h.createdAt).toLocaleString('zh-CN')}</span>
        </div>
      ))}
    </div>
  );
}
