const updateLogs = [
  {
    date: '2026-02-25',
    badge: '建站起点',
    title: '网站第一版完成，可部署主框架正式建立',
    summary: '这是网站建立的起点。主站第一版已经具备首页、同步课程、课程详情、作业方案、学习路径和关于页等核心结构。',
    details: ['完成主站框架、课程内容读取和基础页面搭建', '必修二学习路径图上线，项目进入可部署状态']
  },
  {
    date: '2026-02-25',
    badge: '栏目上线',
    title: '真题专区加入主站，首页导航第一次扩展',
    summary: '网站在最初的同步课程和学习路径之外，补上了高考真题专区，让主站开始形成更完整的栏目结构。',
    details: ['新增真题专区页面', '首页与导航同步加入对应入口']
  },
  {
    date: '2026-02-25',
    badge: '功能补强',
    title: '课程视频后台接入，课程页开始支持视频覆盖',
    summary: '为了让课程内容更容易维护，网站增加了课程视频后台，可以对课程视频链接做集中管理。',
    details: ['新增视频后台页面与 Supabase 覆盖逻辑', '课程详情页开始支持视频展示与后续维护']
  },
  {
    date: '2026-02-25',
    badge: '专题扩展',
    title: '提分专区独立成型，补上方法、诊断与工具页',
    summary: '在真题内容之外，网站新增独立的提分专区，开始系统化整理诊断、框架、方法和执行工具。',
    details: ['新增高考系统专题首页和独立主题布局', '加入错题卡、时间块、复习计划等执行工具页面']
  },
  {
    date: '2026-02-26',
    badge: '内容扩充',
    title: '学习路径改成平面向量路线图，并补上资料库',
    summary: '网站开始从基础页面进入内容细化阶段，学习路径页多次迭代，最终改成平面向量路线图，同时加入资料库页面。',
    details: ['学习路径图重新排版，修正重叠与间距问题', '新增资料库和三角函数练习 HTML 文件']
  },
  {
    date: '2026-02-28',
    badge: '结构完善',
    title: '首页表达统一，难度分级页面加入提分专区',
    summary: '这一天主要做了整站表达和结构整理，同时把难度分级正式加入提分专区和主导航。',
    details: ['统一首页、导航、品牌和关于页文案', '新增难度分级页面，并调整示例卡片展示']
  },
  {
    date: '2026-03-01',
    badge: '最近同步',
    title: '成绩追踪系统上线，并补充课程资料同步',
    summary: '网站开始支持成绩追踪与后台管理，同时补充了课程视频解析、讲义同步和学习资料整理。',
    details: ['新增成绩追踪页与后台管理入口', '更新课程视频跳转逻辑，并整理上传学习笔记与提取文本']
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
            <p className="mt-2 text-sm text-ink/80">这里按建站时间顺序记录网站的发展过程，从 2026-02-25 建站开始，一直到最近一次更新。</p>
          </div>
          <span className="inline-flex w-fit rounded-full border border-accent/15 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">建站记录</span>
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
                      {log.badge}
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
