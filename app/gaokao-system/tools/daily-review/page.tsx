type Field = {
  name: string;
  type: string;
  note: string;
};

const fields: Field[] = [
  { name: 'date', type: '日期', note: '复盘日期' },
  { name: 'today_key_tasks', type: '文本', note: '今日关键任务' },
  { name: 'completion_rate', type: '百分比', note: '任务完成率' },
  { name: 'time_focus_ratio', type: '百分比', note: '高效时间块占比' },
  { name: 'method_habit_score', type: '数值', note: '方法习惯分（0-100）' },
  { name: 'attitude_score', type: '数值', note: '学习态度分（0-100）' },
  { name: 'efficiency_score', type: '数值', note: '状态效率分（0-100）' },
  { name: 'mastery_score', type: '数值', note: '知识掌握分（0-100）' },
  { name: 'time_mgmt_score', type: '数值', note: '时间管理分（0-100）' },
  { name: 'total_score', type: '数值', note: '总分（0-100）' },
  { name: 'biggest_problem', type: '文本', note: '今日最大问题' },
  { name: 'root_cause', type: '文本', note: '问题根因' },
  { name: 'tomorrow_one_action', type: '文本', note: '明日唯一关键动作' },
  { name: 'notes', type: '文本', note: '补充记录' }
];

export default function DailyReviewToolPage() {
  return (
    <section className="rounded-2xl border border-tide/10 bg-white/80 p-6">
      <h2 className="text-2xl font-semibold text-tide">工具：每日复盘表</h2>
      <p className="mt-2 text-sm text-ink/80">复盘不是自责，是把“今天的问题”转化为“明天可执行动作”。</p>
      <div className="mt-4 rounded-xl border border-tide/10 bg-white p-4 text-sm text-ink/80">
        <p className="font-semibold text-tide">使用步骤</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>回答三问：今天做了什么、做得怎样、如何优化。</li>
          <li>五维度打分并计算总分。</li>
          <li>选一个最低维度作为次日重点修复项。</li>
          <li>写下明日唯一关键动作并安排到时间块。</li>
        </ol>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-tide/20 text-tide">
              <th className="px-3 py-2 font-semibold">字段名</th>
              <th className="px-3 py-2 font-semibold">类型</th>
              <th className="px-3 py-2 font-semibold">说明</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field.name} className="border-b border-tide/10">
                <td className="px-3 py-2 font-mono text-xs text-tide">{field.name}</td>
                <td className="px-3 py-2 text-ink/80">{field.type}</td>
                <td className="px-3 py-2 text-ink/80">{field.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
