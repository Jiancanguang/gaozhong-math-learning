type Field = {
  name: string;
  type: string;
  note: string;
};

const fields: Field[] = [
  { name: 'item_id', type: '文本', note: '条目编号' },
  { name: 'subject', type: '枚举', note: '语文/数学/英语/其他' },
  { name: 'content_title', type: '文本', note: '内容名称' },
  { name: 'first_learn_date', type: '日期', note: '首次学习日期' },
  { name: 'importance', type: '枚举', note: '高/中/低' },
  { name: 'review_d1', type: '日期', note: '第1次复习日' },
  { name: 'review_d2', type: '日期', note: '第2次复习日' },
  { name: 'review_d4', type: '日期', note: '第3次复习日' },
  { name: 'review_d7', type: '日期', note: '第4次复习日' },
  { name: 'review_d14', type: '日期', note: '第5次复习日' },
  { name: 'review_d21', type: '日期', note: '第6次复习日' },
  { name: 'review_d30', type: '日期', note: '第7次复习日' },
  { name: 'status_d1', type: '布尔', note: '第1次是否完成' },
  { name: 'status_d2', type: '布尔', note: '第2次是否完成' },
  { name: 'status_d4', type: '布尔', note: '第3次是否完成' },
  { name: 'status_d7', type: '布尔', note: '第4次是否完成' },
  { name: 'status_d14', type: '布尔', note: '第5次是否完成' },
  { name: 'status_d21', type: '布尔', note: '第6次是否完成' },
  { name: 'status_d30', type: '布尔', note: '第7次是否完成' },
  { name: 'final_mastery', type: '枚举', note: '未掌握/部分掌握/稳定掌握' }
];

export default function ForgettingPlanToolPage() {
  return (
    <section className="rounded-2xl border border-tide/10 bg-white/80 p-6">
      <h2 className="text-2xl font-semibold text-tide">工具：遗忘管理表</h2>
      <p className="mt-2 text-sm text-ink/80">不要等忘了再补，按 1/2/4/7/14/21/30 天节奏复习高价值内容。</p>
      <div className="mt-4 rounded-xl border border-tide/10 bg-white p-4 text-sm text-ink/80">
        <p className="font-semibold text-tide">使用步骤</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>每天录入 1-3 个高价值内容。</li>
          <li>自动生成 7 次复习日期。</li>
          <li>到期执行并勾选完成状态。</li>
          <li>每周清理漏复习条目，避免积压。</li>
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
