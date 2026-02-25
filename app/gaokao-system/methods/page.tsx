const methodCards = [
  {
    title: '30 天方法落地术',
    scene: '刚转系统学习，方法很多但不知如何筛选',
    steps: '5 天调研 + 20 天调适 + 5 天固化',
    metric: '连续 7 天执行率 >= 85%'
  },
  {
    title: '时间分块执行法',
    scene: '任务总被打乱，计划感弱',
    steps: '先切块再排任务，按块打分',
    metric: '专注比持续提升'
  },
  {
    title: '每日复盘法',
    scene: '同类问题重复出现',
    steps: '三问复盘 + 五维打分 + 次日一动作',
    metric: '最低维度分 2 周上升'
  },
  {
    title: '刷题四策略',
    scene: '刷题多但提分慢',
    steps: '重复刷题 / 三色笔 / 秒表提速 / 逆向重构',
    metric: '黑笔占比、蓝笔占比、错题复现率'
  },
  {
    title: '知识体系构建',
    scene: '会单题不会综合',
    steps: '费曼讲解 + 十字提问 + 章节导图',
    metric: '跨题型迁移成功率'
  },
  {
    title: '错题升级法',
    scene: '错题整理很累但效果差',
    steps: '错题卡分层升级到 L5',
    metric: '同类错误复发率下降'
  }
];

export default function MethodsPage() {
  return (
    <section className="gs-card p-6">
      <h2 className="text-2xl font-semibold text-[var(--gs-primary)]">方法库：每个方法都要可执行</h2>
      <p className="mt-2 text-sm text-[var(--gs-muted)]">所有方法统一按“适用场景-操作步骤-评估指标”呈现，避免只懂概念不会落地。</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {methodCards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-[var(--gs-line)] bg-white p-5">
            <h3 className="text-lg font-semibold text-[var(--gs-primary)]">{card.title}</h3>
            <p className="mt-2 text-sm text-[var(--gs-muted)]">
              <span className="font-semibold">适用场景：</span>
              {card.scene}
            </p>
            <p className="mt-1 text-sm text-[var(--gs-muted)]">
              <span className="font-semibold">操作步骤：</span>
              {card.steps}
            </p>
            <p className="mt-1 text-sm text-[var(--gs-muted)]">
              <span className="font-semibold">效果指标：</span>
              {card.metric}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
