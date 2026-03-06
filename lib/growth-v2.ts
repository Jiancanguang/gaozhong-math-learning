export const GROWTH_V2_ADMIN_MODULES = [
  {
    title: '学生档案',
    href: '/admin/growth-v2/students',
    summary: '学生列表、班组归属、家长 token、在读状态与基础统计。'
  },
  {
    title: '课堂记录',
    href: '/admin/growth-v2/lessons',
    summary: '一节课的主题、时间、作业、课堂要点，以及批量成长记录。'
  },
  {
    title: '考试管理',
    href: '/admin/growth-v2/exams',
    summary: '考试主表、成绩录入、掌握度和薄弱点标签统计。'
  }
] as const;

export const GROWTH_V2_PUBLIC_HIGHLIGHTS = [
  '从“考试台账”升级为“成长追踪”',
  '一套数据同时支撑老师后台和家长报告',
  '支持课堂记录、考试记录、掌握度和薄弱点标签',
  '先并行上线，不直接替换旧系统'
] as const;

export const GROWTH_V2_TABLES = [
  'growth_groups',
  'growth_students',
  'growth_lessons',
  'growth_lesson_records',
  'growth_exams',
  'growth_exam_scores',
  'growth_exam_score_tags',
  'growth_tag_catalog'
] as const;

export const GROWTH_V2_MASTERY_OPTIONS = [
  { value: 'lv985', label: '985' },
  { value: 'lvtk', label: '特控线' },
  { value: 'lveb', label: '二本线' },
  { value: 'lvbk', label: '本科线' },
  { value: 'lvzk', label: '专科' }
] as const;

export const GROWTH_V2_NEXT_STEPS = [
  '补课堂记录录入页，替代离线版的单节课批量登记。',
  '补考试录入页，支持批量成绩、掌握度和薄弱点标签写入。',
  '给学生模块加详情页，串起课堂、考试和家长报告入口。',
  '最后再把旧成长追踪入口切到 Growth V2。'
] as const;

export function normalizeGrowthV2Mastery(value: string | null | undefined) {
  if (!value) return null;

  const normalized = value.trim();
  const legacyMap: Record<string, string> = {
    mastered: 'lvtk',
    partial: 'lvbk',
    weak: 'lvzk'
  };

  return legacyMap[normalized] ?? normalized;
}
