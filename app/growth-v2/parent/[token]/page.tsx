type GrowthV2ParentPageProps = {
  params: {
    token: string;
  };
};

const sections = ['进门考与课后测试趋势', '能力雷达图', '知识点掌握情况', '考试成绩与薄弱点分析', '教师时间线评语'];

export default function GrowthV2ParentPage({ params }: GrowthV2ParentPageProps) {
  return (
    <div className="rounded-3xl border border-tide/10 bg-white/85 p-8 shadow-card">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent">Parent Report Placeholder</p>
      <h2 className="mt-3 text-3xl font-semibold text-tide">家长成长报告页骨架</h2>
      <p className="mt-3 text-sm text-ink/75">
        这个路由已经预留出来，后面会直接按 `parent_access_token` 去 Growth V2 表里取学生、课堂记录和考试记录。
      </p>

      <div className="mt-6 rounded-2xl border border-dashed border-tide/25 bg-paper/50 p-5 text-sm text-ink/80">
        当前 token：<span className="font-mono text-tide">{params.token}</span>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {sections.map((item) => (
          <article key={item} className="rounded-xl border border-tide/10 bg-paper/60 p-4 text-sm text-ink/80">
            {item}
          </article>
        ))}
      </div>
    </div>
  );
}

