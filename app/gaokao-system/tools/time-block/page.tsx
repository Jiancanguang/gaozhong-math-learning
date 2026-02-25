type Field = {
  name: string;
  type: string;
  note: string;
};

const fields: Field[] = [
  { name: 'date', type: '日期', note: '当天日期' },
  { name: 'block_id', type: '文本', note: '时间块编号（如 A1）' },
  { name: 'start_time', type: '时间', note: '开始时间' },
  { name: 'end_time', type: '时间', note: '结束时间' },
  { name: 'planned_task', type: '文本', note: '计划任务' },
  { name: 'task_type', type: '枚举', note: '背诵/刷题/复盘/复习/其他' },
  { name: 'priority', type: '枚举', note: '高/中/低' },
  { name: 'actual_done', type: '文本', note: '实际完成内容' },
  { name: 'focus_score', type: '数值', note: '1-10' },
  { name: 'interrupted', type: '布尔', note: '是否被打断' },
  { name: 'interrupt_reason', type: '文本', note: '打断原因' },
  { name: 'next_action', type: '文本', note: '下一步调整动作' }
];

export default function TimeBlockToolPage() {
  return (
    <section className="rounded-2xl border border-tide/10 bg-white/80 p-6">
      <h2 className="text-2xl font-semibold text-tide">工具：时间分块表</h2>
      <p className="mt-2 text-sm text-ink/80">先安排时间，再分配任务。目标不是“做完全部”，而是“关键任务持续推进”。</p>
      <div className="mt-4 rounded-xl border border-tide/10 bg-white p-4 text-sm text-ink/80">
        <p className="font-semibold text-tide">使用步骤</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>先列出当天可自主支配时间。</li>
          <li>按 30 或 60 分钟切块。</li>
          <li>每个时间块分配 1 个任务。</li>
          <li>每块结束后记录效率分。</li>
          <li>晚间统计专注比并做次日微调。</li>
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
