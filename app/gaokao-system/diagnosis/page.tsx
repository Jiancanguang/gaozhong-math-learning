const dimensions = [
  {
    name: '时间执行',
    signal: '计划很多、落地很少；经常被突发任务打断',
    action: '先启用时间分块表，连续记录 7 天专注比'
  },
  {
    name: '专注稳定',
    signal: '学习启动慢，容易分心或拖延',
    action: '固定专注启动流程，并记录每日启动次数'
  },
  {
    name: '错题质量',
    signal: '错题很多但重复犯错，整理后复习不到位',
    action: '使用错题升级卡，强制按 L1-L5 升级'
  },
  {
    name: '知识结构',
    signal: '单题会做，综合题卡顿，迁移困难',
    action: '每周完成 1 张章节导图并做跨题型连接'
  },
  {
    name: '复盘能力',
    signal: '知道问题但不形成次日动作',
    action: '每日复盘只修 1 个关键短板，连续 14 天'
  }
];

const levels = [
  { level: '起步档', rule: '总分 < 60', plan: '先稳执行：时间分块 + 每日复盘' },
  { level: '进阶档', rule: '60-80', plan: '补结构：错题升级 + 遗忘管理 + 分类刷题' },
  { level: '冲刺档', rule: '> 80', plan: '稳输出：套卷节奏 + 考场时间控制 + 波动修复' }
];

export default function DiagnosisPage() {
  return (
    <div className="space-y-6">
      <section className="gs-card p-6">
        <h2 className="text-2xl font-semibold text-[var(--gs-primary)]">诊断评估：先定位，再发力</h2>
        <p className="mt-2 text-sm text-[var(--gs-muted)]">提分不是盲目加码。先知道你卡在哪里，再决定下一步做什么。</p>
      </section>

      <section className="gs-card p-6">
        <h3 className="text-xl font-semibold text-[var(--gs-primary)]">五维诊断</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--gs-line)] text-[var(--gs-primary)]">
                <th className="px-3 py-2 font-semibold">维度</th>
                <th className="px-3 py-2 font-semibold">典型信号</th>
                <th className="px-3 py-2 font-semibold">优先动作</th>
              </tr>
            </thead>
            <tbody>
              {dimensions.map((item) => (
                <tr key={item.name} className="border-b border-[var(--gs-line)] align-top">
                  <td className="px-3 py-3 font-medium text-[var(--gs-primary)]">{item.name}</td>
                  <td className="px-3 py-3 text-[var(--gs-muted)]">{item.signal}</td>
                  <td className="px-3 py-3 text-[var(--gs-muted)]">{item.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="gs-card p-6">
        <h3 className="text-xl font-semibold text-[var(--gs-primary)]">结果分层建议</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {levels.map((item) => (
            <article key={item.level} className="rounded-xl border border-[var(--gs-line)] bg-white p-4">
              <p className="text-sm font-semibold text-[var(--gs-primary)]">{item.level}</p>
              <p className="mt-1 text-sm text-[var(--gs-muted)]">{item.rule}</p>
              <p className="mt-2 text-sm text-[var(--gs-muted)]">{item.plan}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
