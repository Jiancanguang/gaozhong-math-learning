import type { Metadata } from 'next';

import {
  anchors,
  calibrationNote,
  capRule,
  dimensionRules,
  exampleCases,
  hiddenConditionGuides,
  interactionAdjustments,
  levelOrder,
  levelReferences,
  misconceptionNotes,
  readingModelingGuides,
  revisionHighlights,
  scoreBands,
  type LevelKey,
  type ExampleCase,
  type Score,
  typeAdjustments,
  usageCards
} from './content';

export const metadata: Metadata = {
  title: '高考数学难度分级制度',
  description: '用录取线视角解释高考数学题目门槛，帮助学生和家长理解选题、做题与复盘。'
};

const levelStyles: Record<
  LevelKey,
  {
    badge: string;
    soft: string;
    border: string;
    text: string;
  }
> = {
  benke: {
    badge: 'bg-emerald-100 text-emerald-700',
    soft: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700'
  },
  erben: {
    badge: 'bg-sky-100 text-sky-700',
    soft: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-700'
  },
  tekong: {
    badge: 'bg-violet-100 text-violet-700',
    soft: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-700'
  },
  '985': {
    badge: 'bg-amber-100 text-amber-700',
    soft: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700'
  }
};

const scoreWidths: Record<Score, string> = {
  1: '25%',
  2: '50%',
  3: '75%',
  4: '100%'
};

function LevelBadge({ levelKey }: { levelKey: LevelKey }) {
  const level = levelReferences[levelKey];
  const styles = levelStyles[levelKey];

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles.badge}`}>
      {level.label}
    </span>
  );
}

function SectionHeader({
  id,
  title,
  description
}: {
  id: string;
  title: string;
  description: string;
}) {
  return (
    <div id={id} className="scroll-mt-28">
      <p className="text-sm font-semibold uppercase tracking-wider text-[var(--gs-accent)]">Difficulty Grading</p>
      <h2 className="mt-2 text-2xl font-semibold text-[var(--gs-primary)]">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm text-[var(--gs-muted)]">{description}</p>
    </div>
  );
}

function ExampleCard({ example }: { example: ExampleCase }) {
  const styles = levelStyles[example.level];
  const level = levelReferences[example.level];

  return (
    <article className="rounded-2xl border border-[var(--gs-line)] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--gs-accent)]">{example.title}</p>
          <h3 className="mt-1 text-xl font-semibold text-[var(--gs-primary)]">{example.position}</h3>
          <p className="mt-1 text-sm text-[var(--gs-muted)]">{example.difficultyFactor}</p>
        </div>
        <LevelBadge levelKey={example.level} />
      </div>

      <p className="mt-4 text-sm text-[var(--gs-muted)]">{example.prompt}</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {example.dimensions.map((dimension) => (
          <div
            key={dimension.name}
            className={`rounded-xl border px-3 py-3 ${styles.soft} ${styles.border}`}
          >
            <p className="text-xs font-medium text-[var(--gs-muted)]">{dimension.name}</p>
            <div className="mt-2 h-2 rounded-full bg-white/80">
              <div
                className={`h-2 rounded-full bg-current ${styles.text}`}
                style={{ width: scoreWidths[dimension.score] }}
              />
            </div>
            <p className={`mt-2 text-lg font-semibold ${styles.text}`}>{dimension.score}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--gs-line)] bg-[rgba(15,109,140,0.04)] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--gs-primary)]">五维总分</p>
          <p className="mt-1 text-lg font-semibold text-[var(--gs-primary)]">{example.baseScore}</p>
        </div>
        <div className="rounded-xl border border-[var(--gs-line)] bg-[rgba(15,109,140,0.04)] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--gs-primary)]">题型修正</p>
          <p className="mt-1 text-sm text-[var(--gs-muted)]">{example.typeAdjustment}</p>
        </div>
        <div className="rounded-xl border border-[var(--gs-line)] bg-[rgba(15,109,140,0.04)] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--gs-primary)]">交互修正</p>
          <p className="mt-1 text-sm text-[var(--gs-muted)]">{example.interactionAdjustment}</p>
        </div>
      </div>

      <div className={`mt-4 rounded-2xl border px-4 py-4 ${styles.soft} ${styles.border}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-[var(--gs-muted)]">最终定级分</p>
          <div className="flex flex-wrap items-center gap-3">
            <p className={`text-2xl font-semibold ${styles.text}`}>{example.finalScore}</p>
            <LevelBadge levelKey={example.level} />
          </div>
        </div>
        <p className="mt-3 text-sm text-[var(--gs-muted)]">
          这类题对学生意味着什么：{example.takeaway}
        </p>
        <p className="mt-2 text-sm font-medium text-[var(--gs-primary)]">口诀：{level.motto}</p>
      </div>
    </article>
  );
}

export default function DifficultyGradingPage() {
  return (
    <div className="space-y-6">
      <section className="gs-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full bg-[rgba(240,138,36,0.12)] px-3 py-1 text-xs font-semibold text-[var(--gs-accent)]">
              v2.0 修订版
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--gs-primary)] sm:text-3xl">高考数学难度分级制度</h2>
            <p className="mt-3 text-sm text-[var(--gs-muted)]">
              这不是一份“越难越好”的题单，而是一套用录取线视角理解题目门槛的公开说明。它帮助学生看懂自己该先做什么，也帮助家长判断题目难度与训练价值。
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--gs-line)] bg-[rgba(15,109,140,0.05)] p-4 text-sm text-[var(--gs-muted)] md:max-w-xs">
            <p className="font-semibold text-[var(--gs-primary)]">校准口径</p>
            <p className="mt-2">基于广东录取线、模考表现与一线教学经验校准，其他省份可作相对参考。</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          {['看懂题目门槛', '避免盲目刷难题', '帮助选题与复盘'].map((item) => (
            <span
              key={item}
              className="rounded-full bg-[rgba(15,109,140,0.1)] px-3 py-1 font-medium text-[var(--gs-primary)]"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {revisionHighlights.map((item) => (
            <article key={item} className="rounded-2xl border border-[var(--gs-line)] bg-white p-4">
              <p className="text-sm text-[var(--gs-muted)]">{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="gs-card p-4">
        <div className="flex flex-wrap gap-2">
          {anchors.map((anchor) => (
            <a
              key={anchor.id}
              href={`#${anchor.id}`}
              className="rounded-full border border-[var(--gs-line)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--gs-primary)] transition hover:bg-[rgba(15,109,140,0.08)]"
            >
              {anchor.label}
            </a>
          ))}
        </div>
      </section>

      <section className="gs-card p-6">
        <SectionHeader
          id="why-grade"
          title="为什么这样分级"
          description="这套制度的核心不是给题目贴标签，而是用“多大比例的学生能稳定做对”来理解一题的真实门槛。"
        />
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--gs-line)] text-[var(--gs-primary)]">
                <th className="px-3 py-2 font-semibold">层级</th>
                <th className="px-3 py-2 font-semibold">数学分参考</th>
                <th className="px-3 py-2 font-semibold">占满分比例</th>
                <th className="px-3 py-2 font-semibold">含义</th>
              </tr>
            </thead>
            <tbody>
              {levelOrder.map((key) => {
                const level = levelReferences[key];

                return (
                  <tr key={key} className="border-b border-[var(--gs-line)] align-top">
                    <td className="px-3 py-3">
                      <LevelBadge levelKey={key} />
                    </td>
                    <td className="px-3 py-3 text-[var(--gs-muted)]">{level.scoreRange}</td>
                    <td className="px-3 py-3 text-[var(--gs-muted)]">{level.ratio}</td>
                    <td className="px-3 py-3 text-[var(--gs-muted)]">{level.meaning}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-5 rounded-2xl border border-[var(--gs-line)] bg-[rgba(15,109,140,0.04)] p-4 text-sm text-[var(--gs-muted)]">
          题目难度的本质，是这道题能被多大比例的考生稳定做对。这里的分层参考，综合了广东录取数据、模考均分和一线教学经验，用来帮助你判断题目门槛，而不是替代真实考试评价。
        </div>
      </section>

      <section className="gs-card p-6">
        <SectionHeader
          id="five-dimensions"
          title="五维评判模型"
          description="拿到一道题，先不急着说“难”或“简单”，先拆成五个维度看门槛到底在哪里。"
        />
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[980px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--gs-line)] text-[var(--gs-primary)]">
                <th className="px-3 py-2 font-semibold">评判维度</th>
                <th className="px-3 py-2 font-semibold">1 分</th>
                <th className="px-3 py-2 font-semibold">2 分</th>
                <th className="px-3 py-2 font-semibold">3 分</th>
                <th className="px-3 py-2 font-semibold">4 分</th>
              </tr>
            </thead>
            <tbody>
              {dimensionRules.map((rule) => (
                <tr key={rule.name} className="border-b border-[var(--gs-line)] align-top">
                  <td className="px-3 py-3 font-medium text-[var(--gs-primary)]">{rule.name}</td>
                  <td className="px-3 py-3 text-[var(--gs-muted)]">{rule.score1}</td>
                  <td className="px-3 py-3 text-[var(--gs-muted)]">{rule.score2}</td>
                  <td className="px-3 py-3 text-[var(--gs-muted)]">{rule.score3}</td>
                  <td className="px-3 py-3 text-[var(--gs-muted)]">{rule.score4}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-[var(--gs-line)] bg-white p-5">
            <h3 className="text-lg font-semibold text-[var(--gs-primary)]">隐含条件如何计数</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--gs-line)] text-[var(--gs-primary)]">
                    <th className="px-3 py-2 font-semibold">类型</th>
                    <th className="px-3 py-2 font-semibold">示例</th>
                    <th className="px-3 py-2 font-semibold">判断提醒</th>
                  </tr>
                </thead>
                <tbody>
                  {hiddenConditionGuides.map((item) => (
                    <tr key={item.type} className="border-b border-[var(--gs-line)] align-top">
                      <td className="px-3 py-3 font-medium text-[var(--gs-primary)]">{item.type}</td>
                      <td className="px-3 py-3 text-[var(--gs-muted)]">{item.example}</td>
                      <td className="px-3 py-3 text-[var(--gs-muted)]">{item.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-[var(--gs-muted)]">
              实操时先把隐含条件逐条列出来，再决定是 2 分、3 分还是 4 分，不要把多个独立条件混成一个。
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--gs-line)] bg-white p-5">
            <h3 className="text-lg font-semibold text-[var(--gs-primary)]">图象信息提取何时至少算 3 分</h3>
            <div className="mt-4 space-y-3">
              {readingModelingGuides.map((item) => (
                <div key={item.scene} className="rounded-xl border border-[var(--gs-line)] bg-[rgba(15,109,140,0.04)] p-4">
                  <p className="text-sm font-semibold text-[var(--gs-primary)]">{item.scene}</p>
                  <p className="mt-2 text-sm text-[var(--gs-muted)]">示例：{item.example}</p>
                  <p className="mt-2 text-sm text-[var(--gs-muted)]">{item.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-[var(--gs-muted)]">
              图象题里，“隐含条件”关注的是条件数量，“阅读与建模”关注的是图与代数来回切换的认知成本，两个维度要分开判断。
            </p>
          </article>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--gs-line)] text-[var(--gs-primary)]">
                <th className="px-3 py-2 font-semibold">五维总分</th>
                <th className="px-3 py-2 font-semibold">难度等级</th>
                <th className="px-3 py-2 font-semibold">判定说明</th>
              </tr>
            </thead>
            <tbody>
              {scoreBands.map((band) => (
                <tr key={band.range} className="border-b border-[var(--gs-line)] align-top">
                  <td className="px-3 py-3 font-medium text-[var(--gs-primary)]">{band.range}</td>
                  <td className="px-3 py-3 text-[var(--gs-muted)]">{band.label}</td>
                  <td className="px-3 py-3 text-[var(--gs-muted)]">{band.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="gs-card p-6">
        <SectionHeader
          id="adjustments"
          title="修正规则"
          description="五维总分是底座，但题型机制和多维度叠加会改变真实考场体感，所以还要做两层修正。"
        />

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[920px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--gs-line)] text-[var(--gs-primary)]">
                <th className="px-3 py-2 font-semibold">题型</th>
                <th className="px-3 py-2 font-semibold">修正幅度</th>
                <th className="px-3 py-2 font-semibold">修正理由</th>
                <th className="px-3 py-2 font-semibold">操作说明</th>
              </tr>
            </thead>
            <tbody>
              {typeAdjustments.map((rule) => (
                <tr key={rule.item} className="border-b border-[var(--gs-line)] align-top">
                  <td className="px-3 py-3 font-medium text-[var(--gs-primary)]">{rule.item}</td>
                  <td className="px-3 py-3 text-[var(--gs-muted)]">{rule.range}</td>
                  <td className="px-3 py-3 text-[var(--gs-muted)]">{rule.reason}</td>
                  <td className="px-3 py-3 text-[var(--gs-muted)]">{rule.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[920px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--gs-line)] text-[var(--gs-primary)]">
                <th className="px-3 py-2 font-semibold">触发条件</th>
                <th className="px-3 py-2 font-semibold">修正幅度</th>
                <th className="px-3 py-2 font-semibold">为什么要修</th>
                <th className="px-3 py-2 font-semibold">怎么用</th>
              </tr>
            </thead>
            <tbody>
              {interactionAdjustments.map((rule) => (
                <tr key={rule.item} className="border-b border-[var(--gs-line)] align-top">
                  <td className="px-3 py-3 font-medium text-[var(--gs-primary)]">{rule.item}</td>
                  <td className="px-3 py-3 text-[var(--gs-muted)]">{rule.range}</td>
                  <td className="px-3 py-3 text-[var(--gs-muted)]">{rule.reason}</td>
                  <td className="px-3 py-3 text-[var(--gs-muted)]">{rule.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-2xl border border-[var(--gs-line)] bg-white p-5">
            <h3 className="text-lg font-semibold text-[var(--gs-primary)]">最终公式</h3>
            <div className="mt-4 rounded-2xl bg-[rgba(15,109,140,0.06)] px-4 py-5 text-center text-base font-semibold text-[var(--gs-primary)] sm:text-lg">
              {capRule.formula}
            </div>
            <p className="mt-4 text-sm text-[var(--gs-muted)]">{capRule.over20}</p>
          </article>
          <article className="rounded-2xl border border-[var(--gs-line)] bg-white p-5">
            <h3 className="text-lg font-semibold text-[var(--gs-primary)]">{capRule.title}</h3>
            <p className="mt-4 text-sm text-[var(--gs-muted)]">{capRule.summary}</p>
          </article>
        </div>

        <article className="mt-6 rounded-2xl border border-[var(--gs-line)] bg-[rgba(240,138,36,0.08)] p-5">
          <h3 className="text-lg font-semibold text-[var(--gs-primary)]">{calibrationNote.title}</h3>
          <p className="mt-3 text-sm text-[var(--gs-muted)]">{calibrationNote.body}</p>
        </article>
      </section>

      <section className="gs-card p-6">
        <SectionHeader
          id="how-to-use"
          title="怎么使用"
          description="这页不是给教研组内部讨论专用的，它首先服务于学生和家长的日常判断：先做什么，怎么做，做到什么程度算有效。"
        />

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {usageCards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-[var(--gs-line)] bg-white p-5">
              <h3 className="text-lg font-semibold text-[var(--gs-primary)]">{card.title}</h3>
              <div className="mt-4 space-y-3">
                {card.items.map((item) => (
                  <div key={item.label} className="rounded-xl border border-[var(--gs-line)] bg-[rgba(15,109,140,0.04)] p-4">
                    <p className="text-sm font-semibold text-[var(--gs-primary)]">{item.label}</p>
                    <p className="mt-2 text-sm text-[var(--gs-muted)]">{item.text}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <article className="mt-6 rounded-2xl border border-dashed border-[var(--gs-line)] bg-white p-5">
          <h3 className="text-lg font-semibold text-[var(--gs-primary)]">这套制度不是什么</h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[var(--gs-muted)]">
            {misconceptionNotes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="gs-card p-6">
        <SectionHeader
          id="examples"
          title="代表例题"
          description="首版只保留四个校准例子，分别覆盖本科、二本、特控和 985 四个层级，帮助你快速建立直觉。"
        />
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          {exampleCases.map((example) => (
            <ExampleCard key={example.title} example={example} />
          ))}
        </div>
      </section>

      <section className="gs-card p-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--gs-accent)]">Quick Guide</p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--gs-primary)]">快速判定口诀</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {levelOrder.map((key) => {
            const level = levelReferences[key];
            const styles = levelStyles[key];

            return (
              <article key={key} className={`rounded-2xl border p-5 ${styles.soft} ${styles.border}`}>
                <LevelBadge levelKey={key} />
                <p className={`mt-4 text-lg font-semibold ${styles.text}`}>{level.motto}</p>
                <p className="mt-2 text-sm text-[var(--gs-muted)]">{level.meaning}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
