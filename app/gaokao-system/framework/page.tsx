const principles = ['做少一点，但做对', '做慢一点，但持续', '做完一次，不如做成闭环'];

const layers = [
  {
    title: '认知层（方向）',
    points: ['长期思维：关注趋势，不被短期波动绑架', '系统思维：看整体能力，不迷信单次结果', '优化思维：遇到问题先诊断再改进', '成长思维：接受当前不够好，但必须持续变好']
  },
  {
    title: '执行层（过程）',
    points: ['时间分块：先定时间，再定任务', '专注启动：用固定动作降低进入状态成本', '每日复盘：每天 10 分钟提取反馈并修正']
  },
  {
    title: '训练层（能力）',
    points: ['刷题策略：从数量导向转为问题导向', '知识体系：从会一题到会一类', '错题升级：分级推进，直到稳定做对', '遗忘管理：按节奏重复，稳定进入长期记忆']
  },
  {
    title: '冲刺层（结果）',
    points: ['在校/在家都维持节奏', '碎片时间持续回收', '临考前稳状态、稳手感、稳输出']
  }
];

const cycles = [
  { period: '每日', action: '时间分块 + 专注执行 + 复盘打分' },
  { period: '每周', action: '看趋势不看情绪，修一个关键短板' },
  { period: '每月', action: '系统重评估并更新策略组合' }
];

export default function FrameworkPage() {
  return (
    <div className="space-y-6">
      <section className="gs-card p-6">
        <h2 className="text-2xl font-semibold text-[var(--gs-primary)]">系统提分框架：从“拼命学”到“会提分”</h2>
        <p className="mt-2 text-sm text-[var(--gs-muted)]">
          提分的本质不是做更多题，而是建立稳定学习系统。一个稳定系统=明确方向+正确动作+持续反馈+快速修正。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {layers.map((layer) => (
          <article key={layer.title} className="gs-card p-5">
            <h3 className="text-lg font-semibold text-[var(--gs-primary)]">{layer.title}</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--gs-muted)]">
              {layer.points.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="gs-card p-6">
        <h3 className="text-xl font-semibold text-[var(--gs-primary)]">闭环机制</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {cycles.map((cycle) => (
            <article key={cycle.period} className="rounded-xl border border-[var(--gs-line)] bg-white p-4">
              <p className="text-sm font-semibold text-[var(--gs-primary)]">{cycle.period}</p>
              <p className="mt-2 text-sm text-[var(--gs-muted)]">{cycle.action}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="gs-card p-6">
        <h3 className="text-xl font-semibold text-[var(--gs-primary)]">框架原则</h3>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {principles.map((item) => (
            <span key={item} className="rounded-full bg-[rgba(15,109,140,0.1)] px-3 py-1 font-medium text-[var(--gs-primary)]">
              {item}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
