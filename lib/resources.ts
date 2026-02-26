export type TeachingResource = {
  id: string;
  title: string;
  description: string;
  category: string;
  updatedAt: string;
  href: string;
  openInNewTab: boolean;
};

export const teachingResources: TeachingResource[] = [
  {
    id: 'trig-properties-practice-30',
    title: '练30_三角函数性质综合',
    description: '三角函数性质综合练习，适合课堂巩固与课后复盘。',
    category: '三角函数',
    updatedAt: '2026-02-26',
    href: '/练30_三角函数性质综合.html',
    openInNewTab: true
  }
];
