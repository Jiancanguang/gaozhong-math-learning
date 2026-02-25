const columns = [
  {
    section: '首页',
    pages: ['`/gaokao-system`'],
    goal: '30 秒看懂网站价值',
    outline: '主张、三承诺、四层总览、常见问题、核心入口'
  },
  {
    section: '提分框架',
    pages: ['`/gaokao-system/framework`'],
    goal: '讲清方法论与闭环',
    outline: '四层框架、输入输出、每日/每周/每月机制、断点修复'
  },
  {
    section: '诊断评估',
    pages: ['`/gaokao-system/diagnosis`'],
    goal: '先定位短板再投入',
    outline: '五维评分、分层建议、优先动作'
  },
  {
    section: '方法库',
    pages: ['`/gaokao-system/methods`'],
    goal: '结构化方法索引',
    outline: '场景、步骤、指标三段式'
  },
  {
    section: '学科突破',
    pages: ['`/gaokao-system/subjects`'],
    goal: '语数英分科执行',
    outline: '学科策略 + 周节奏模板'
  },
  {
    section: '30 天计划',
    pages: ['`/gaokao-system/30days`'],
    goal: '给新用户最小可执行路径',
    outline: '四周任务 + 每日打卡模板'
  },
  {
    section: '工具中心',
    pages: ['`/gaokao-system/tools`', '`/gaokao-system/tools/time-block`', '`/gaokao-system/tools/daily-review`', '`/gaokao-system/tools/forgetting-plan`', '`/gaokao-system/tools/error-card`'],
    goal: '直接落地执行',
    outline: '每个工具含：适用场景、使用步骤、字段定义、指标建议'
  }
];

export default function ArchitecturePage() {
  return (
    <section className="gs-card p-6">
      <h2 className="text-2xl font-semibold text-[var(--gs-primary)]">网站信息架构（当前上线版）</h2>
      <p className="mt-2 text-sm text-[var(--gs-muted)]">本分区与原课程网站分离，采用独立路由空间，避免原课程信息被稀释。</p>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--gs-line)] text-[var(--gs-primary)]">
              <th className="px-3 py-2 font-semibold">栏目</th>
              <th className="px-3 py-2 font-semibold">页面</th>
              <th className="px-3 py-2 font-semibold">页面目标</th>
              <th className="px-3 py-2 font-semibold">文案大纲</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((item) => (
              <tr key={item.section} className="border-b border-[var(--gs-line)] align-top">
                <td className="px-3 py-3 font-medium text-[var(--gs-primary)]">{item.section}</td>
                <td className="px-3 py-3 text-[var(--gs-muted)]">{item.pages.join('、')}</td>
                <td className="px-3 py-3 text-[var(--gs-muted)]">{item.goal}</td>
                <td className="px-3 py-3 text-[var(--gs-muted)]">{item.outline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
