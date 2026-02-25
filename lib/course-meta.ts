export function mapChapterName(chapter: string): string {
  const names: Record<string, string> = {
    functions: '函数',
    trigonometry: '三角函数',
    sequences: '数列',
    'analytic-geometry': '解析几何基础',
    vectors: '平面向量及其应用',
    complex: '复数',
    'solid-geometry': '立体几何',
    statistics: '统计',
    probability: '概率统计',
    calculus: '导数初步'
  };

  return names[chapter] ?? chapter;
}
