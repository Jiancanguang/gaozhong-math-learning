export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-tide">关于与反馈</h1>
      <p className="mt-3 text-sm text-ink/80">
        这个网站服务于高一高二数学同步学习。每节课都采用统一结构，帮助学生在有限时间内完成高质量复盘。
      </p>

      <section className="mt-6 rounded-2xl border border-tide/10 bg-white/80 p-6">
        <h2 className="text-xl font-semibold text-tide">课程结构</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/80">
          <li>知识点讲解：抓住定义、性质和公式来源</li>
          <li>例题拆解：突出思路路径，不只给答案</li>
          <li>易错点提醒：定位常见失分环节</li>
          <li>课后小练：巩固本节重点</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-tide/10 bg-white/80 p-6">
        <h2 className="text-xl font-semibold text-tide">反馈入口</h2>
        <p className="mt-3 text-sm text-ink/80">如果你想补某个章节，或发现讲义错误，可以通过下面方式反馈：</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/80">
          <li>邮箱：feedback@example.com</li>
          <li>问卷：将来会在此放置问卷链接</li>
        </ul>
      </section>
    </div>
  );
}
