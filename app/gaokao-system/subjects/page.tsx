const subjects = [
  {
    name: '语文',
    strategy: ['题型拆解优先于泛阅读', '主观题答案结构模板化', '作文素材按主题分层积累'],
    weekly: '2 次阅读训练 + 2 次主观题改写 + 1 次作文素材复盘'
  },
  {
    name: '数学',
    strategy: ['题型分类训练+反向归纳', '重难题重复刷透不追新', '秒表控时提升完整作答率'],
    weekly: '3 套分题型训练 + 2 次错题升级 + 1 次套卷时间复盘'
  },
  {
    name: '英语',
    strategy: ['词汇与长难句并行', '阅读理解按出题类型拆解', '作文模板转为个性化表达'],
    weekly: '5 天词汇循环 + 3 组阅读限时 + 2 篇作文仿写'
  }
];

export default function SubjectsPage() {
  return (
    <section className="gs-card p-6">
      <h2 className="text-2xl font-semibold text-[var(--gs-primary)]">学科突破：语数英三线并进</h2>
      <p className="mt-2 text-sm text-[var(--gs-muted)]">通用系统决定下限，学科策略决定上限。每科都要有可执行周节奏。</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {subjects.map((subject) => (
          <article key={subject.name} className="rounded-2xl border border-[var(--gs-line)] bg-white p-5">
            <h3 className="text-lg font-semibold text-[var(--gs-primary)]">{subject.name}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--gs-muted)]">
              {subject.strategy.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-[var(--gs-muted)]">
              <span className="font-semibold">建议周节奏：</span>
              {subject.weekly}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
