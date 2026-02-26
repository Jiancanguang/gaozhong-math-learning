type Field = {
  name: string;
  type: string;
  note: string;
};

const fields: Field[] = [
  { name: 'card_id', type: '文本', note: '错题卡编号' },
  { name: 'subject', type: '枚举', note: '语文/数学/英语/其他' },
  { name: 'source', type: '文本', note: '来源（试卷/作业/资料）' },
  { name: 'topic', type: '文本', note: '题型或知识点' },
  { name: 'error_type', type: '枚举', note: '审题/概念/计算/方法/时间分配' },
  { name: 'current_level', type: '枚举', note: 'L1-L5' },
  { name: 'first_error_date', type: '日期', note: '首次出错日期' },
  { name: 'last_review_date', type: '日期', note: '最近复习日期' },
  { name: 'next_review_date', type: '日期', note: '下次复习日期' },
  { name: 'attempt_count', type: '数值', note: '重做次数' },
  { name: 'success_count', type: '数值', note: '完全正确次数' },
  { name: 'key_points', type: '文本', note: '关键点提炼' },
  { name: 'trigger_condition', type: '文本', note: '下次再错触发条件' },
  { name: 'status', type: '枚举', note: '在练/待复习/已毕业' },
  { name: 'archive_date', type: '日期', note: '归档日期' }
];

export default function ErrorCardToolPage() {
  return (
    <section className="rounded-2xl border border-tide/10 bg-white/80 p-6">
      <h2 className="text-2xl font-semibold text-tide">工具：错题升级卡</h2>
      <p className="mt-2 text-sm text-ink/80">错题不是收藏品，是升级系统。每道题都要经过重做、升级、归档。</p>
      <div className="mt-4 rounded-xl border border-tide/10 bg-white p-4 text-sm text-ink/80">
        <p className="font-semibold text-tide">升级规则</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>新错题进入 L1。</li>
          <li>重做完全正确才可升级。</li>
          <li>出现关键失误则留在原级继续练。</li>
          <li>到 L5 后稳定正确可归档。</li>
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
