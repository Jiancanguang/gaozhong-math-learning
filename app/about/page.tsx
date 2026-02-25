export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-tide">关于与反馈</h1>
      <p className="mt-3 text-sm text-ink/80">
        这是我的数学个人教学网站。当前重点是先做好高一下同步课程，再持续补齐高三高考真题讲解。
      </p>

      <section className="mt-6 rounded-2xl border border-tide/10 bg-white/80 p-6">
        <h2 className="text-xl font-semibold text-tide">当前内容结构</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/80">
          <li>高一下同步：按周推进知识点、例题和课后巩固</li>
          <li>高三真题：按题型拆解思路、得分点与常见失分点</li>
          <li>知识点讲解：抓住定义、性质和公式来源</li>
          <li>例题拆解：突出思路路径，不只给答案</li>
          <li>练习与复盘：定位常见失分环节并及时修正</li>
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
