// Pet system constants and types

export const PET_TYPES = [
  { id: 'dragon', name: '小龙', emoji: '\ud83d\udc32' },
  { id: 'phoenix', name: '凤凰', emoji: '\ud83e\udda4' },
  { id: 'tiger', name: '白虎', emoji: '\ud83d\udc2f' },
  { id: 'turtle', name: '玄武', emoji: '\ud83d\udc22' },
  { id: 'unicorn', name: '麒麟', emoji: '\ud83e\udd84' },
  { id: 'fox', name: '灵狐', emoji: '\ud83e\udd8a' },
  { id: 'wolf', name: '苍狼', emoji: '\ud83d\udc3a' },
  { id: 'eagle', name: '金鹰', emoji: '\ud83e\udd85' },
  { id: 'panda', name: '熊猫', emoji: '\ud83d\udc3c' },
  { id: 'rabbit', name: '玉兔', emoji: '\ud83d\udc30' },
  { id: 'deer', name: '瑞鹿', emoji: '\ud83e\udd8c' },
  { id: 'cat', name: '灵猫', emoji: '\ud83d\udc31' },
  { id: 'owl', name: '夜枭', emoji: '\ud83e\udd89' },
  { id: 'whale', name: '鲲', emoji: '\ud83d\udc33' },
  { id: 'butterfly', name: '蝶仙', emoji: '\ud83e\udd8b' },
  { id: 'lion', name: '狻猊', emoji: '\ud83e\udd81' },
  { id: 'bear', name: '棕熊', emoji: '\ud83d\udc3b' },
  { id: 'monkey', name: '灵猴', emoji: '\ud83d\udc35' },
  { id: 'horse', name: '天马', emoji: '\ud83d\udc34' },
  { id: 'snake', name: '青蛇', emoji: '\ud83d\udc0d' },
  { id: 'crane', name: '仙鹤', emoji: '\ud83e\udda9' }
] as const;

export type PetTypeId = (typeof PET_TYPES)[number]['id'];

export const DEFAULT_LEVEL_THRESHOLDS = [0, 5, 12, 20, 30, 40, 52, 65, 80, 100];
export const MAX_LEVEL = 10;

export const PET_LEVEL_LABELS = [
  '蛋蛋', // lv1
  '幼崽', // lv2
  '成长', // lv3
  '活泼', // lv4
  '强壮', // lv5
  '威武', // lv6
  '英勇', // lv7
  '传说', // lv8
  '神话', // lv9
  '毕业'  // lv10
] as const;

export const PET_ADMIN_MODULES = [
  {
    title: '班级管理',
    href: '/admin/pet',
    summary: '创建班级、配置等级规则和小卖部商品。'
  },
  {
    title: '学生管理',
    href: '/admin/pet/students',
    summary: '添加学生、分配宠物、查看成长进度。'
  }
] as const;

export function getPetType(id: string) {
  return PET_TYPES.find((p) => p.id === id) ?? null;
}

export function computeLevel(foodCount: number, thresholds: number[]): number {
  let level = 1;
  for (let i = 1; i < thresholds.length; i++) {
    if (foodCount >= thresholds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return Math.min(level, MAX_LEVEL);
}

export function getLevelLabel(level: number): string {
  return PET_LEVEL_LABELS[Math.min(level, MAX_LEVEL) - 1] ?? '未知';
}

export function getLevelProgress(foodCount: number, level: number, thresholds: number[]): { current: number; next: number; percent: number } {
  if (level >= MAX_LEVEL) return { current: foodCount, next: thresholds[thresholds.length - 1], percent: 100 };
  const current = thresholds[level - 1] ?? 0;
  const next = thresholds[level] ?? 100;
  const progress = foodCount - current;
  const needed = next - current;
  return { current: foodCount, next, percent: needed > 0 ? Math.min(100, Math.round((progress / needed) * 100)) : 100 };
}

export type PetAction = 'feed' | 'score' | 'graduate' | 'exchange';

export const PET_TABLES = [
  'pet_classes',
  'pet_students',
  'pet_history'
] as const;
