export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-tide">关于我</h1>
      <p className="mt-3 text-sm text-ink/80">
        这是我的数学教学主站。网站围绕同步课程、真题讲解和系统提分三条线展开，目标是把知识点讲清楚，把题型做出来，把复盘真正落地。
      </p>

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
