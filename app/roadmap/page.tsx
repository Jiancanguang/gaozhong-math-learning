import type { Route } from 'next';
import Link from 'next/link';

type Layer = {
  title: string;
  subtitle: string;
  nodes: string[];
};

type Stage = {
  name: string;
  period: string;
  goal: string;
  methods: string;
  questionTypes: string;
  done: string;
};

type Pitfall = {
  issue: string;
  symptom: string;
  fix: string;
};

const layers: Layer[] = [
  {
    title: '前置层',
    subtitle: '输入能力',
    nodes: ['三角函数基础', '坐标系与距离', '平面几何基础', '代数变形能力']
  },
  {
    title: '核心层',
    subtitle: '平面向量',
    nodes: ['概念（模与方向）', '运算（加减数乘）', '共线与线性表示', '坐标表示与判定', '数量积应用', '综合应用建模']
  },
  {
    title: '后续层',
    subtitle: '全链路迁移',
    nodes: ['解三角形迁移', '解析几何迁移', '圆锥曲线方法', '空间向量过渡']
  },
  {
    title: '收束层',
    subtitle: '高考综合',
    nodes: ['建系 -> 设向量 -> 运算化简 -> 几何回译']
  }
];

const stages: Stage[] = [
  {
    name: '阶段 0',
    period: '1-3 天',
    goal: '补齐进入向量学习前的最低能力，避免后续卡在计算和判定。',
    methods: '三角函数基本值与诱导公式；两点距离；平行垂直性质；代数恒等变形。',
    questionTypes: '三角值速算、距离计算、几何关系代数化、分式根式化简。',
    done: '20 分钟 10 题，正确率 >= 80%。'
  },
  {
    name: '阶段 1',
    period: '第 1 周',
    goal: '建立向量对象意识，熟练完成加减、数乘、线性表示。',
    methods: '向量相等判定；共线定理；平行四边形法则；向量方程变形。',
    questionTypes: '线段关系表示、共线证明、点分问题、中点与重心表示。',
    done: '30 分钟 8 题，正确率 >= 75%。'
  },
  {
    name: '阶段 2',
    period: '第 2 周',
    goal: '完成从几何直观到代数计算的迁移。',
    methods: '坐标表示；模长公式；数量积公式；平行垂直坐标判定。',
    questionTypes: '夹角、垂直平行判定、长度关系证明、最值初步。',
    done: '综合题 6 道，至少 5 道一次做对。'
  },
  {
    name: '阶段 3',
    period: '第 3 周',
    goal: '形成建系-设向量-运算-回译的完整闭环。',
    methods: '几何条件向量化；参数法；向量法证明平行垂直；轨迹建模。',
    questionTypes: '证明题、最值题、轨迹题、参数范围题。',
    done: '45 分钟 2 道综合大题，过程完整。'
  },
  {
    name: '阶段 4',
    period: '第 4 周',
    goal: '将方法迁移到解三角形、解析几何、圆锥曲线和空间向量。',
    methods: '方向向量/法向量；夹角距离向量化；平面到空间符号迁移。',
    questionTypes: '圆锥曲线向量条件题、空间线面关系题、综合压轴拼接题。',
    done: '近 3 年相关子问得分率 >= 70%。'
  }
];

const pitfalls: Pitfall[] = [
  {
    issue: '把向量当纯数字算',
    symptom: '出现“向量相除”或忽略方向。',
    fix: '每步标注量类型（向量/标量/长度），禁止跨类型运算。'
  },
  {
    issue: '数量积符号混乱',
    symptom: '会背公式但代入常错号。',
    fix: '先写 a·b=|a||b|cosθ，再代数化，最后统一检查正负。'
  },
  {
    issue: '几何图不建系',
    symptom: '题意看懂但无法下笔计算。',
    fix: '先定原点与基向量，强制进入坐标化流程。'
  },
  {
    issue: '共线判定手段单一',
    symptom: '只会比例法，参数题卡住。',
    fix: '并行训练 b=λa 与坐标法，根据题型切换。'
  },
  {
    issue: '只算不回译',
    symptom: '算出表达式但答非所问。',
    fix: '结尾必须加“几何回译”一句，翻译为图形结论。'
  },
  {
    issue: '空间迁移断层',
    symptom: '平面会做，空间不会起步。',
    fix: '同题型先做平面版再做空间版，保持四步模板一致。'
  }
];

const weeklyPlan = [
  {
    week: '第 1 周',
    focus: '概念与线性运算',
    daily: '30 分钟复盘 + 30 分钟基础题 + 10 分钟错因记录',
    check: '1 套基础卷，定位薄弱点'
  },
  {
    week: '第 2 周',
    focus: '坐标化与数量积',
    daily: '20 分钟公式训练 + 40 分钟专项题 + 15 分钟复盘',
    check: '1 套数量积综合小卷'
  },
  {
    week: '第 3 周',
    focus: '综合应用题',
    daily: '45 分钟限时大题 + 20 分钟重做 + 10 分钟模板归纳',
    check: '2 道大题完整书写'
  },
  {
    week: '第 4 周',
    focus: '全链路迁移',
    daily: '30 分钟迁移训练 + 30 分钟真题 + 15 分钟纠错',
    check: '近年真题专题测评'
  }
];

const sprintPlan = [
  {
    period: '第 1 周',
    arrangement: '前置查漏半天 + 概念运算 2 天 + 坐标与数量积 3 天 + 阶段测 1 天'
  },
  {
    period: '第 2 周',
    arrangement: '综合应用 3 天 + 解析/空间迁移 2 天 + 真题压轴与复盘 2 天'
  }
];

const quickLinks: Array<{ label: string; href: Route }> = [
  { label: '平面向量课程', href: '/courses?chapter=vectors' as Route },
  { label: '按关键词找题（向量）', href: '/courses?q=%E5%90%91%E9%87%8F' as Route },
  { label: '高考提分系统', href: '/gaokao' as Route }
];

export default function RoadmapPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-tide/10 bg-white/80 p-7 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">人教 A 版 · 必修第二册</p>
        <h1 className="mt-2 text-3xl font-semibold text-tide">平面向量学习路径图</h1>
        <p className="mt-3 max-w-4xl text-sm text-ink/80">
          面向高中生自学的全链路路线：前置能力 → 平面向量核心 → 解三角形/解析几何/圆锥曲线/空间向量迁移 → 高考综合策略。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {quickLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-full border border-tide/15 bg-paper px-3 py-1 text-xs font-medium text-tide transition hover:border-accent/35 hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </header>

      <section className="mt-8 rounded-3xl border border-tide/10 bg-white/90 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold text-tide">学习路径总览（方框 + 连线）</h2>
          <p className="text-xs text-ink/70">主线：前置知识 → 平面向量核心 → 后续分支 → 高考综合应用</p>
        </div>

        <div className="relative mt-5 hidden h-[720px] rounded-2xl border border-slate-300 bg-white p-6 md:block">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <marker id="flow-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,8 L8,4 z" fill="#334155" />
              </marker>
            </defs>

            <path d="M24 27 V31 H50 V35" fill="none" stroke="#334155" strokeWidth="0.24" markerEnd="url(#flow-arrow)" />
            <path d="M50 27 V31" fill="none" stroke="#334155" strokeWidth="0.24" />
            <path d="M76 27 V31 H50" fill="none" stroke="#334155" strokeWidth="0.24" />

            <path d="M50 57 V63 H23 V69" fill="none" stroke="#334155" strokeWidth="0.24" markerEnd="url(#flow-arrow)" />
            <path d="M50 57 V69" fill="none" stroke="#334155" strokeWidth="0.24" markerEnd="url(#flow-arrow)" />
            <path d="M50 57 V63 H77 V69" fill="none" stroke="#334155" strokeWidth="0.24" markerEnd="url(#flow-arrow)" />

            <path d="M23 80 V84 H50 V88" fill="none" stroke="#334155" strokeWidth="0.24" markerEnd="url(#flow-arrow)" />
            <path d="M50 80 V88" fill="none" stroke="#334155" strokeWidth="0.24" markerEnd="url(#flow-arrow)" />
            <path d="M77 80 V84 H50" fill="none" stroke="#334155" strokeWidth="0.24" />
          </svg>

          <article className="absolute left-[8%] top-[5%] w-[84%] rounded-xl border border-slate-400 bg-slate-50/40 p-4">
            <h3 className="text-center text-2xl font-semibold tracking-[0.2em] text-slate-800">前置知识</h3>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-slate-400 bg-white p-3 text-base text-slate-700">平面直角坐标系</div>
              <div className="rounded-lg border border-slate-400 bg-white p-3 text-base text-slate-700">三角函数（必修一）</div>
              <div className="rounded-lg border border-slate-400 bg-white p-3 text-base text-slate-700">初中平面几何（平行/垂直/三角形）</div>
            </div>
          </article>

          <article className="absolute left-[22%] top-[34%] w-[56%] rounded-xl border border-slate-400 bg-white p-6">
            <h3 className="text-center text-5xl font-semibold text-slate-800">第六章 平面向量及其应用</h3>
            <ul className="mt-5 space-y-3 text-[1.95rem] text-slate-800">
              <li>
                <span className="font-semibold text-[#c45524]">6.1</span> 概念（方向 + 大小）
              </li>
              <li>
                <span className="font-semibold text-[#c45524]">6.2</span> 运算（加/减/数乘/数量积）
              </li>
              <li>
                <span className="font-semibold text-[#c45524]">6.3</span> 坐标表示（坐标化判定）
              </li>
              <li>
                <span className="font-semibold text-[#c45524]">6.4</span> 应用（证明/最值/轨迹）
              </li>
            </ul>
          </article>

          <article className="absolute left-[11%] top-[70%] w-[23%] rounded-xl border border-slate-400 bg-white p-4">
            <h4 className="text-[2rem] font-semibold text-slate-800">解三角形</h4>
            <p className="mt-1 text-[1.55rem] text-slate-600">余弦/正弦定理</p>
          </article>

          <article className="absolute left-[38.5%] top-[70%] w-[23%] rounded-xl border border-slate-400 bg-white p-4">
            <h4 className="text-[2rem] font-semibold text-slate-800">解析几何</h4>
            <p className="mt-1 text-[1.55rem] text-slate-600">直线/圆锥曲线</p>
          </article>

          <article className="absolute left-[66%] top-[70%] w-[23%] rounded-xl border border-slate-400 bg-white p-4">
            <h4 className="text-[2rem] font-semibold text-slate-800">空间向量</h4>
            <p className="mt-1 text-[1.55rem] text-slate-600">立体几何迁移</p>
          </article>

          <article className="absolute left-[35%] top-[87%] w-[30%] rounded-xl border border-slate-400 bg-white p-3 text-center">
            <h4 className="text-[2rem] font-semibold text-slate-800">高考综合应用</h4>
            <p className="mt-1 text-[1.45rem] text-slate-600">向量贯穿始终</p>
          </article>
        </div>

        <div className="mt-5 grid gap-3 md:hidden">
          {layers.map((layer) => (
            <article key={layer.title} className="rounded-2xl border border-tide/10 bg-paper/95 p-4">
              <h3 className="text-base font-semibold text-tide">{layer.title}</h3>
              <p className="text-xs text-ink/65">{layer.subtitle}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/85">
                {layer.nodes.map((node) => (
                  <li key={node}>{node}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-tide/10 bg-white/90 p-6">
        <h2 className="text-xl font-semibold text-tide">分阶段学习清单</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-tide/15 text-tide">
                <th className="px-3 py-2 font-semibold">阶段</th>
                <th className="px-3 py-2 font-semibold">目标</th>
                <th className="px-3 py-2 font-semibold">必会方法</th>
                <th className="px-3 py-2 font-semibold">典型题型</th>
                <th className="px-3 py-2 font-semibold">达标标准</th>
              </tr>
            </thead>
            <tbody>
              {stages.map((stage) => (
                <tr key={stage.name} className="border-b border-tide/10 align-top text-ink/80">
                  <td className="px-3 py-3 font-medium text-tide">
                    {stage.name}
                    <p className="text-xs font-normal text-ink/60">{stage.period}</p>
                  </td>
                  <td className="px-3 py-3">{stage.goal}</td>
                  <td className="px-3 py-3">{stage.methods}</td>
                  <td className="px-3 py-3">{stage.questionTypes}</td>
                  <td className="px-3 py-3">{stage.done}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-tide/10 bg-white/90 p-6">
          <h2 className="text-xl font-semibold text-tide">常见误区与纠偏</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {pitfalls.map((item) => (
              <li key={item.issue} className="rounded-2xl border border-tide/10 bg-paper/90 p-3">
                <p className="font-semibold text-tide">{item.issue}</p>
                <p className="mt-1 text-ink/70">表现：{item.symptom}</p>
                <p className="mt-1 text-ink/80">纠偏：{item.fix}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-tide/10 bg-white/90 p-6">
          <h2 className="text-xl font-semibold text-tide">4 周执行节奏</h2>
          <div className="mt-4 space-y-3 text-sm">
            {weeklyPlan.map((item) => (
              <div key={item.week} className="rounded-2xl border border-tide/10 bg-paper/90 p-3">
                <p className="font-semibold text-tide">{item.week} · {item.focus}</p>
                <p className="mt-1 text-ink/80">每日：{item.daily}</p>
                <p className="mt-1 text-ink/70">周末验收：{item.check}</p>
              </div>
            ))}
          </div>

          <h3 className="mt-5 text-lg font-semibold text-tide">2 周冲刺版（可选）</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink/80">
            {sprintPlan.map((item) => (
              <li key={item.period} className="rounded-xl border border-tide/10 bg-white/80 px-3 py-2">
                <span className="font-medium text-tide">{item.period}：</span>
                {item.arrangement}
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-2xl border border-dashed border-tide/20 bg-white/70 p-3 text-sm text-ink/75">
            冲刺要求：每天至少 1 次限时训练（20-45 分钟）+ 1 次错题重做（不看答案），每 2 天更新一次易错清单。
          </div>
        </article>
      </section>
    </div>
  );
}
