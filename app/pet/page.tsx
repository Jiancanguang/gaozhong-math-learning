import type { Route } from 'next';
import Link from 'next/link';

import { PET_TYPES, PET_LEVEL_LABELS, DEFAULT_LEVEL_THRESHOLDS } from '@/lib/pet';

export default function PetIntroPage() {
  const adminHref = '/admin/pet' as Route;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-tide/10 bg-white/85 p-6">
          <h2 className="text-2xl font-semibold text-tide">班级宠物系统</h2>
          <p className="mt-2 text-sm text-ink/75">
            每位同学可以认领一只守护神兽，通过完成学习任务获得食物投喂宠物，宠物从1级成长到10级毕业，毕业后获得徽章，徽章可以到小卖部兑换奖品。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['选择守护神兽', '老师投喂食物', '宠物升级成长', '满级毕业得徽章', '徽章兑换奖品'].map((item) => (
              <span key={item} className="rounded-full bg-tide/10 px-3 py-1 text-xs font-medium text-tide">
                {item}
              </span>
            ))}
          </div>
          <div className="mt-6">
            <Link href={adminHref} className="rounded-lg bg-tide px-4 py-2 text-sm font-medium text-white transition hover:bg-tide/90">
              老师入口（管理后台）
            </Link>
          </div>
        </article>

        <article className="rounded-2xl border border-tide/10 bg-white/85 p-6">
          <h2 className="text-2xl font-semibold text-tide">成长阶段</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {PET_LEVEL_LABELS.map((label, i) => (
              <div key={label} className="rounded-lg border border-tide/10 bg-paper/60 px-3 py-2">
                <span className="text-sm font-medium text-tide">Lv.{i + 1} {label}</span>
                <span className="ml-2 text-xs text-ink/40">{DEFAULT_LEVEL_THRESHOLDS[i]} 食物</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-tide/10 bg-white/85 p-6">
        <h2 className="text-2xl font-semibold text-tide">可选守护神兽</h2>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-7">
          {PET_TYPES.map((pet) => (
            <div key={pet.id} className="flex flex-col items-center rounded-xl border border-tide/10 bg-paper/50 px-2 py-3 text-center">
              <span className="text-3xl">{pet.emoji}</span>
              <span className="mt-1 text-xs font-medium text-ink">{pet.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
