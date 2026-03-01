export type LevelKey = 'benke' | 'erben' | 'tekong' | '985';

export type Score = 1 | 2 | 3 | 4;

export type LevelReference = {
  key: LevelKey;
  label: string;
  scoreRange: string;
  ratio: string;
  meaning: string;
  motto: string;
};

export type DimensionRule = {
  name: string;
  score1: string;
  score2: string;
  score3: string;
  score4: string;
};

export type AdjustmentRule = {
  item: string;
  range: string;
  reason: string;
  action: string;
};

export type ExampleCase = {
  title: string;
  position: string;
  difficultyFactor: string;
  level: LevelKey;
  prompt: string;
  baseScore: number;
  typeAdjustment: string;
  interactionAdjustment: string;
  finalScore: number;
  takeaway: string;
  dimensions: Array<{
    name: string;
    score: Score;
  }>;
};

export type GradingNote = {
  title: string;
  body: string;
};

export const anchors = [
  { id: 'why-grade', label: '为什么这样分级' },
  { id: 'five-dimensions', label: '五维模型' },
  { id: 'adjustments', label: '修正规则' },
  { id: 'how-to-use', label: '怎么使用' },
  { id: 'examples', label: '代表例题' }
] as const;

export const revisionHighlights = [
  '维度交互修正：解决多个维度同时偏高时被加法模型低估的问题。',
  '填空题修正升级：压轴填空按 +1 到 +2 处理，不再按常规填空低估。',
  '阅读与建模补强：图象信息提取加入专项评分指引。',
  '修正总量设上限：题型修正与交互修正合计不超过 +3。'
] as const;

export const levelOrder: LevelKey[] = ['benke', 'erben', 'tekong', '985'];

export const levelReferences: Record<LevelKey, LevelReference> = {
  benke: {
    key: 'benke',
    label: '本科线',
    scoreRange: '45-60 / 150',
    ratio: '30%-40%',
    meaning: '只需掌握基础题即可达到。单选前几题 + 填空基础题；多选以争取部分分为主；解答第一问。',
    motto: '一看就会，一做就对'
  },
  erben: {
    key: 'erben',
    label: '二本线',
    scoreRange: '60-85 / 150',
    ratio: '40%-57%',
    meaning: '基础题基本拿住 + 中档题大部分。单选中前段较稳，填空前两题争取得分；多选通常能拿部分分，偶尔可做对 1 题；解答能写前两问。',
    motto: '知道方向，需要拐弯'
  },
  tekong: {
    key: 'tekong',
    label: '特控线',
    scoreRange: '85-110 / 150',
    ratio: '57%-73%',
    meaning: '基础 + 中档大体稳住，难题能拿步骤分。单选基本稳，填空前两题较稳；多选通常至少 1 题接近全对或全对，另外题目能拿部分分；解答题前段较完整。',
    motto: '路径多条，需要选择'
  },
  '985': {
    key: '985',
    label: '985/211',
    scoreRange: '110-130+ / 150',
    ratio: '73%-87%+',
    meaning: '基础中档基本不失分，较难题也能持续得分。单选填空整体稳定；多选整体得分高，但不以三题全对为常态，通常有 1-2 题全对、其余题拿部分分；解答题主体完成度高，压轴题能做出关键问，上沿学生可接近完整。',
    motto: '没有套路，需要创造'
  }
};

export const gradingNotes: GradingNote[] = [
  {
    title: '口径校准',
    body: '110-130 分段更贴近“压轴题能突破、能拿较多步骤分”，而不是“压轴题普遍完整解答、解答题接近满分”。后者通常更接近 130+ 乃至更高分段。'
  },
  {
    title: '多选题口径',
    body: '新高考 I 卷的多选题更适合按“有效得分”而非“全对题数”判断。特控线看的是能否稳定拿部分分并做对其中较难的 1 题；985/211 看的是整体高得分，但三道多选全部做对并不是常态要求。'
  }
] as const;

export const dimensionRules: DimensionRule[] = [
  {
    name: '知识点数量',
    score1: '单一知识点，直接考查定义。',
    score2: '2 个知识点，同章节联合。',
    score3: '2-3 个知识点，跨节综合。',
    score4: '3 个以上知识点，跨章节甚至跨模块。'
  },
  {
    name: '思维转化',
    score1: '直接套公式，模式识别即可。',
    score2: '需要一步转化，如找中间值、换底。',
    score3: '需要多步转化、方法选择或分类讨论。',
    score4: '需要构造、放缩、分离参数等创造性思维。'
  },
  {
    name: '运算复杂度',
    score1: '一两步简单计算，口算可完成。',
    score2: '3-5 步常规计算，需细心但套路明确。',
    score3: '多步计算加字母运算，易出错且需验证。',
    score4: '大量复杂运算或含参数的精细讨论。'
  },
  {
    name: '隐含条件',
    score1: '无隐含条件，题目信息直白。',
    score2: '有 1 个隐含条件，如定义域限制。',
    score3: '有 2-3 个隐含条件，需同时处理。',
    score4: '4 个以上或条件深度隐藏，需从题意中挖掘。'
  },
  {
    name: '阅读与建模',
    score1: '纯数学语言，读题即可动笔。',
    score2: '简单情境包装，一步建模。',
    score3: '实际背景需提取信息再建模，或需从图象提取 2 个以上独立信息。',
    score4: '复杂情境或开放性问题，需要抽象建模。'
  }
];

export const hiddenConditionGuides = [
  {
    type: '图形信息',
    example: '从图像读取零点、单调性、极值点、渐近线。',
    note: '每个独立信息都算 1 个隐含条件。'
  },
  {
    type: '方向或类型判断',
    example: '零点是上行还是下行，极值是极大还是极小。',
    note: '不只是“有”，还要判断性质。'
  },
  {
    type: '定义域与参数约束',
    example: '|φ|<π/2、ω>0、a≠0。',
    note: '这些条件常在排除多余解时决定成败。'
  },
  {
    type: '位置关系判断',
    example: '点在曲线上方还是下方，同弧还是异弧。',
    note: '需要结合图形或题意才能确定。'
  },
  {
    type: '隐含等式或不等式',
    example: '判别式≥0、面积非零、向量共线。',
    note: '题目未明说，但解题时必须补充。'
  }
] as const;

export const readingModelingGuides = [
  {
    scene: '从函数图象中提取 2 个以上独立信息',
    example: '读取 f(0) 正负、零点位置、交点所在单调区间。',
    note: '信息要经历“看图 -> 写成代数条件”的转换。'
  },
  {
    scene: '图文混合且图象信息是解题关键',
    example: '给解析式和图象，必须结合图象才能排除多余解。',
    note: '图象不是装饰，而是必经步骤。'
  },
  {
    scene: '需要判断图象局部特征',
    example: '判断上凸下凸、切线斜率正负、拐点位置。',
    note: '这类题对函数直觉和空间感要求更高。'
  }
] as const;

export const scoreBands = [
  { range: '5-8 分', label: '本科线', description: '各维度多为最低档，属于送分题。' },
  { range: '9-12 分', label: '二本线', description: '有 1-2 个维度进入中档，需要一定技巧。' },
  { range: '13-16 分', label: '特控线', description: '多数维度处于中高档，需要熟练与方法选择。' },
  { range: '17-20 分', label: '985/211', description: '多数维度拉满，需要创造性思维与综合能力。' }
] as const;

export const typeAdjustments: AdjustmentRule[] = [
  {
    item: '单选题（第 1-8 题）',
    range: '不修正',
    reason: '标准题型，五维总分通常已能反映真实门槛。',
    action: '五维总分直接定级。'
  },
  {
    item: '多选题（第 9-11 题）',
    range: '+1 到 +2',
    reason: '要逐项判断，容错率低，错选直接归零。',
    action: '选项独立性强取 +2，可互验时取 +1。'
  },
  {
    item: '填空题（第 12-14 题）',
    range: '+0 到 +2',
    reason: '没有选项可排除，也没有过程分，链式出错直接归零。',
    action: '常规填空 +0 到 +1，压轴填空通常按 +1 到 +2。'
  },
  {
    item: '解答题（第 15-19 题）',
    range: '不修正',
    reason: '有过程分，通常按小问分别定级更准确。',
    action: '每一问单独打五维分，再看整题主体难度。'
  }
];

export const interactionAdjustments: AdjustmentRule[] = [
  {
    item: '3 个及以上维度 >= 3 分',
    range: '+1 到 +2',
    reason: '多个维度同时偏高时，失误风险会叠加成乘法效应。',
    action: '3 个维度达到 3 分取 +1，4-5 个维度达到 3 分取 +2。'
  },
  {
    item: '2 个维度同时 = 4 分',
    range: '+1',
    reason: '出现双重创造性门槛，即使其他维度较低，体感也会陡增。',
    action: '直接补 +1，用来修正单看总分的低估。'
  },
  {
    item: '未触发以上条件',
    range: '不修正',
    reason: '普通题或单一维度突出的题，原始五维总分已够用。',
    action: '保持原始总分，不额外叠加。'
  }
];

export const capRule = {
  title: '修正总量上限',
  formula: '最终定级分 = 五维总分 + 题型修正分 + 维度交互修正分',
  summary: '题型修正与交互修正合计不超过 +3；超过时，应先回头检查五维打分是否偏高。',
  over20: '超过 20 分仍归为 985/211，可额外标注“超纲”或“竞赛渗透”。'
} as const;

export const calibrationNote = {
  title: '2023 新课标 II 卷压轴填空给出的修订提醒',
  body: 'v2.0 的核心不是把所有压轴填空都抬到 985 级，而是既补足填空题的链式风险，也防止修正规则无限叠加。遇到“链条长但每步常规”的题，要警惕把思维转化误打成 4 分。'
} as const;

export const usageCards = [
  {
    title: '学生视角',
    items: [
      { label: '选题', text: '先把当前水平附近的题做稳，不要一上来就追 985 级。' },
      { label: '做题', text: '错题不仅看对错，还要判断自己到底卡在知识、转化、运算还是隐含条件。' },
      { label: '复盘', text: '长期卡在同一维度，说明训练方式该调整，而不是只增加题量。' }
    ]
  },
  {
    title: '家长视角',
    items: [
      { label: '看定位', text: '孩子做错高难题，不一定是基础差，也可能只是当前门槛不匹配。' },
      { label: '看进步', text: '先稳定本科线和二本线题目的正确率，再追特控和 985 更有效。' },
      { label: '看投入', text: '不同层级题目的训练价值不同，不宜只盯着最难的那一档。' }
    ]
  }
] as const;

export const misconceptionNotes = [
  '它不是绝对分数预测器，只是帮助你判断一题的门槛和训练价值。',
  '它不是所有省份都完全同口径的标准，广东口径更接近这份制度的原始校准。',
  '它也不是“等级越高越值得刷”，对多数学生而言，先稳住适配层级更重要。'
] as const;

export const exampleCases: ExampleCase[] = [
  {
    title: '示例 1',
    position: '第 1 题（单选）',
    difficultyFactor: '难度系数 0.94',
    level: 'benke',
    prompt: '题干摘要：求 (1+5i)·i 的虚部。',
    baseScore: 5,
    typeAdjustment: '无（单选题）',
    interactionAdjustment: '无',
    finalScore: 5,
    takeaway: '这类题属于基础分，目标不是“会做”，而是读完就能稳定秒杀。',
    dimensions: [
      { name: '知识点数量', score: 1 },
      { name: '思维转化', score: 1 },
      { name: '运算复杂度', score: 1 },
      { name: '隐含条件', score: 1 },
      { name: '阅读与建模', score: 1 }
    ]
  },
  {
    title: '示例 2',
    position: '第 7 题（单选）',
    difficultyFactor: '难度系数 0.85',
    level: 'erben',
    prompt: '题干摘要：圆上到直线距离为 1 的点恰有 2 个，求半径范围。',
    baseScore: 9,
    typeAdjustment: '无（单选题）',
    interactionAdjustment: '无',
    finalScore: 9,
    takeaway: '这类题的门槛不在公式本身，而在能不能把题意转成几何关系并处理边界。',
    dimensions: [
      { name: '知识点数量', score: 2 },
      { name: '思维转化', score: 2 },
      { name: '运算复杂度', score: 2 },
      { name: '隐含条件', score: 2 },
      { name: '阅读与建模', score: 1 }
    ]
  },
  {
    title: '示例 3',
    position: '第 9 题（多选）',
    difficultyFactor: '难度系数 0.65',
    level: 'tekong',
    prompt: '题干摘要：在正三棱柱中判断四个空间关系选项的正误。',
    baseScore: 11,
    typeAdjustment: '+2（多选题，选项间独立性强）',
    interactionAdjustment: '无',
    finalScore: 13,
    takeaway: '多选题常被低估，真正的难点是工作量、判断路径和低容错率叠在一起。',
    dimensions: [
      { name: '知识点数量', score: 3 },
      { name: '思维转化', score: 3 },
      { name: '运算复杂度', score: 2 },
      { name: '隐含条件', score: 2 },
      { name: '阅读与建模', score: 1 }
    ]
  },
  {
    title: '示例 4',
    position: '第 19 题（解答压轴）',
    difficultyFactor: '难度系数 0.40',
    level: '985',
    prompt: '题干摘要：围绕 5cosx-cos5x 的最值、证明与恒成立条件展开三问递进。',
    baseScore: 18,
    typeAdjustment: '无（解答题）',
    interactionAdjustment: '+2（5 个维度中有 5 个达到 3 分及以上）',
    finalScore: 20,
    takeaway: '压轴题通常不是某一步特别怪，而是知识、转化、隐含条件和表达链条同时拉高。',
    dimensions: [
      { name: '知识点数量', score: 4 },
      { name: '思维转化', score: 4 },
      { name: '运算复杂度', score: 3 },
      { name: '隐含条件', score: 4 },
      { name: '阅读与建模', score: 3 }
    ]
  }
];
