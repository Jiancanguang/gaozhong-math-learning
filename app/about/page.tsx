const updateLogs = [
  {
    date: '2026-03-01',
    title: '成绩追踪系统与后台管理上线',
    summary: '站内补齐了成绩追踪页面和配套后台，开始支持围绕学生考试数据做记录、查看和维护。',
    details: ['新增成绩追踪页，方便按阶段回看分数变化', '新增后台入口，可管理学生资料、考试记录和趋势展示']
  },
  {
    date: '2026-02-28',
    title: '提分专区新增难度分级页面',
    summary: '提分专区补上了难度分级模块，把训练内容按层次拆开，帮助学生更清楚地判断当前训练重点。',
    details: ['新增难度分级页面内容', '导航栏加入入口，示例卡片版式同步整理']
  },
  {
    date: '2026-02-28',
    title: '首页、导航和关于页文案统一',
    summary: '首页表达、站点导航和关于页说明做了一轮统一整理，让栏目定位更清楚，首次访问时更容易看懂整站结构。',
    details: ['首页文案重新收束，重点更明确', '导航与关于页同步调整，整体品牌表达更一致']
  },
  {
    date: '2026-02-26',
    title: '学习路径页完成排版修正',
    summary: '学习路径页面对信息卡片和连接关系做了重新调整，解决了重叠与间距不均的问题，阅读体验更顺。',
    details: ['优化路径图卡片布局和视觉平衡', '修正卡片重叠与连接线间距问题']
  }
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-tide">关于我</h1>
      <p className="mt-3 text-sm text-ink/80">
        这是我的数学教学主站。网站围绕同步课程、真题讲解和系统提分三条线展开，目标是把知识点讲清楚，把题型做出来，把复盘真正落地。
      </p>

      <section className="mt-6 rounded-2xl border border-tide/10 bg-white/80 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-tide">更新进度</h2>
            <p className="mt-2 text-sm text-ink/80">这里按时间倒序记录网站最近完成的更新，后续每补一个模块都会继续记在这里。</p>
          </div>
          <span className="inline-flex w-fit rounded-full border border-accent/15 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">持续更新中</span>
        </div>

        <div className="relative mt-6 pl-6 before:absolute before:bottom-3 before:left-[0.7rem] before:top-3 before:w-px before:bg-gradient-to-b before:from-sky/60 before:via-tide/25 before:to-accent/45 sm:pl-8 sm:before:left-[0.95rem]">
          <div className="space-y-5">
            {updateLogs.map((log) => (
              <article
                key={`${log.date}-${log.title}`}
                className="relative rounded-2xl border border-tide/10 bg-paper/70 p-4 shadow-sm shadow-tide/5"
              >
                <span className="absolute -left-[1.62rem] top-5 h-3 w-3 rounded-full border-2 border-white bg-accent shadow-[0_0_0_6px_rgba(255,107,53,0.12)] sm:-left-[2.12rem]" />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="inline-flex rounded-full bg-tide/8 px-2.5 py-1 text-[11px] font-semibold tracking-[0.16em] text-tide">
                      最近更新
                    </span>
                    <h3 className="mt-3 text-base font-semibold text-tide">{log.title}</h3>
                  </div>
                  <span className="inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-accent ring-1 ring-accent/15">
                    {log.date}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-ink/80">{log.summary}</p>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink/75">
                  {log.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-tide/10 bg-white/80 p-6">
        <h2 className="text-xl font-semibold text-tide">这个网站在做什么</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/80">
          <li>同步课程：按学校进度持续补齐高一下核心章节</li>
          <li>真题讲解：按年份、题型和专题拆解高三高考真题</li>
          <li>系统提分：提供诊断、方法和执行工具，帮助学生形成闭环</li>
          <li>个性化作业：根据薄弱点推荐课程并生成作业方案</li>
          <li>资料整理：沉淀讲义、练习和专题资料，方便复习与回看</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-tide/10 bg-white/80 p-6">
        <h2 className="text-xl font-semibold text-tide">联系与反馈</h2>
        <p className="mt-3 text-sm text-ink/80">如果你想补某个章节、某套真题，或者发现讲义和资料里的问题，可以通过下面方式联系我：</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/80">
          <li>邮箱：jiancanguang@qq.com</li>
          <li>B 站 / 抖音 / 公众号：主页持续更新</li>
        </ul>
      </section>
    </div>
  );
}
