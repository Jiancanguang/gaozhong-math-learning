const plan = [
  {
    week: '第 1 周：搭系统',
    tasks: ['建立时间分块表并执行 7 天', '建立每日复盘记录', '完成一次基线诊断']
  },
  {
    week: '第 2 周：提效率',
    tasks: ['加入专注启动流程', '建立错题升级卡并处理首批错题', '压缩无效时间 15%']
  },
  {
    week: '第 3 周：补漏洞',
    tasks: ['启用遗忘管理表', '每科至少修复 1 个高频漏洞', '完成一次三色笔策略检测']
  },
  {
    week: '第 4 周：稳输出',
    tasks: ['按周节奏完成套卷或专题训练', '聚焦最低维度持续修复', '输出月末复盘报告']
  }
];

const dailyTemplate = [
  '今天最重要的 1 件事是什么？',
  '今天高价值时间块有几个？',
  '今天哪个问题最影响提分效率？',
  '明天只修哪一个短板？'
];

export default function ThirtyDaysPage() {
  return (
    <div className="space-y-6">
      <section className="gs-card p-6">
        <h2 className="text-2xl font-semibold text-[var(--gs-primary)]">30 天上手计划</h2>
        <p className="mt-2 text-sm text-[var(--gs-muted)]">目标不是 30 天暴涨分，而是 30 天完成学习系统切换。</p>
      </section>

      <section className="gs-card p-6">
        <h3 className="text-xl font-semibold text-[var(--gs-primary)]">四周任务</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {plan.map((item) => (
            <article key={item.week} className="rounded-xl border border-[var(--gs-line)] bg-white p-4">
              <p className="text-sm font-semibold text-[var(--gs-primary)]">{item.week}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--gs-muted)]">
                {item.tasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="gs-card p-6">
        <h3 className="text-xl font-semibold text-[var(--gs-primary)]">每日打卡模板</h3>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-[var(--gs-muted)]">
          {dailyTemplate.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
