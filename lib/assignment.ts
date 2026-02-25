import { Course } from '@/lib/courses';

export type Weakness = {
  id: string;
  label: string;
  description: string;
  grade: '10' | '11' | 'all';
  keywords: string[];
  methods: string[];
};

export type RecommendedCartItem = {
  course: Course;
  weaknessIds: string[];
  matchReasons: string[];
};

export type HomeworkPack = {
  id: string;
  studentName: string;
  studentGrade: '10' | '11';
  dueDate: string;
  totalDuration: string;
  methodsToMaster: string[];
  courseIds: string[];
  summary: string;
};

export const WEAKNESSES: Weakness[] = [
  {
    id: 'function-domain',
    label: '函数定义域易错',
    description: '分母、根号、对数条件合并不完整。',
    grade: '10',
    keywords: ['函数', '定义域', '值域'],
    methods: ['定义域三条件排查', '多条件合并区间']
  },
  {
    id: 'trig-radian',
    label: '角度弧度转换不稳',
    description: '角度制与弧度制互转速度慢，符号易错。',
    grade: '10',
    keywords: ['弧度制', '角度制', '三角函数'],
    methods: ['角弧互化模板', '负角与象限判断']
  },
  {
    id: 'sequence-model',
    label: '数列建模不清晰',
    description: '等差关系识别慢，通项与前 n 项混淆。',
    grade: '10',
    keywords: ['数列', '等差', '通项'],
    methods: ['等差数列判定', '通项到求和转化']
  },
  {
    id: 'line-equation',
    label: '直线方程选择困难',
    description: '点斜式、斜截式、一般式切换不熟。',
    grade: '10',
    keywords: ['直线', '方程', '解析几何'],
    methods: ['方程式型选择', '已知条件到方程构造']
  },
  {
    id: 'space-line-plane',
    label: '空间线面关系混乱',
    description: '平行垂直关系和判定定理使用不稳定。',
    grade: '11',
    keywords: ['立体几何', '线面', '平面'],
    methods: ['线面位置关系判定', '定理条件对照法']
  },
  {
    id: 'classical-prob',
    label: '古典概型计数不完整',
    description: '样本空间漏算，等可能前提判断不准。',
    grade: '11',
    keywords: ['概率', '古典概型', '计数'],
    methods: ['样本空间枚举', '有利事件计数']
  },
  {
    id: 'derivative-base',
    label: '基础求导公式不熟',
    description: '幂函数、三角函数求导易漏步骤。',
    grade: '11',
    keywords: ['导数', '求导公式', '切线斜率'],
    methods: ['常见函数求导清单', '求导后代点计算']
  },
  {
    id: 'derivative-extreme',
    label: '导数求极值断点遗漏',
    description: '不会完整列出驻点和不可导点。',
    grade: '11',
    keywords: ['导数', '极值', '单调性'],
    methods: ['临界点完整枚举', '符号表判断增减性']
  }
];

function parseDurationMinutes(duration: string): number {
  const match = duration.match(/\d+/);
  if (!match) return 0;
  return Number(match[0]);
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function scoreCourseByWeakness(course: Course, weakness: Weakness): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (weakness.grade !== 'all' && course.grade === weakness.grade) {
    score += 2;
    reasons.push('年级匹配');
  }

  for (const keyword of weakness.keywords) {
    const inTags = course.tags.some((tag) => tag.includes(keyword));
    const inTitle = course.title.includes(keyword);
    const inSummary = course.summary.includes(keyword);

    if (inTags || inTitle || inSummary) {
      score += 3;
      reasons.push(`命中关键词：${keyword}`);
    }
  }

  return { score, reasons: unique(reasons) };
}

export function getWeaknessByGrade(grade: '10' | '11') {
  return WEAKNESSES.filter((item) => item.grade === 'all' || item.grade === grade);
}

export function recommendCoursesForWeakness(courses: Course[], weakness: Weakness, limit = 2): RecommendedCartItem[] {
  const ranked = courses
    .map((course) => {
      const scored = scoreCourseByWeakness(course, weakness);
      return {
        course,
        score: scored.score,
        reasons: scored.reasons
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.course.order - b.course.order)
    .slice(0, limit);

  return ranked.map((item) => ({
    course: item.course,
    weaknessIds: [weakness.id],
    matchReasons: item.reasons
  }));
}

export function buildRecommendedCart(courses: Course[], selectedWeaknessIds: string[], grade: '10' | '11') {
  const weaknesses = getWeaknessByGrade(grade).filter((item) => selectedWeaknessIds.includes(item.id));
  const coursePool = courses.filter((course) => course.grade === grade);

  const cartMap = new Map<string, RecommendedCartItem>();

  for (const weakness of weaknesses) {
    const recommendations = recommendCoursesForWeakness(coursePool, weakness, 2);

    for (const item of recommendations) {
      const existing = cartMap.get(item.course.id);
      if (existing) {
        existing.weaknessIds = unique([...existing.weaknessIds, ...item.weaknessIds]);
        existing.matchReasons = unique([...existing.matchReasons, ...item.matchReasons]);
      } else {
        cartMap.set(item.course.id, item);
      }
    }
  }

  return Array.from(cartMap.values()).sort(
    (a, b) => parseDurationMinutes(a.course.duration) - parseDurationMinutes(b.course.duration)
  );
}

export function summarizeTotalDuration(courses: Course[]) {
  const totalMinutes = courses.reduce((sum, course) => sum + parseDurationMinutes(course.duration), 0);
  return `${totalMinutes}分钟`;
}

export function buildHomeworkPack(params: {
  studentName: string;
  studentGrade: '10' | '11';
  dueDate: string;
  selectedWeaknessIds: string[];
  courses: Course[];
}): HomeworkPack {
  const selectedWeaknesses = WEAKNESSES.filter((item) => params.selectedWeaknessIds.includes(item.id));
  const methodsToMaster = unique(selectedWeaknesses.flatMap((item) => item.methods));

  return {
    id: `HW-${Date.now()}`,
    studentName: params.studentName,
    studentGrade: params.studentGrade,
    dueDate: params.dueDate,
    totalDuration: summarizeTotalDuration(params.courses),
    methodsToMaster,
    courseIds: params.courses.map((course) => course.id),
    summary: `共 ${params.courses.length} 节课，预计 ${summarizeTotalDuration(params.courses)}，重点提升 ${selectedWeaknesses
      .map((item) => item.label)
      .join('、') || '基础能力'}。`
  };
}
