import 'server-only';

import { buildTablePath, supabaseAdminRequest } from '@/lib/supabase-admin';
import { computeLevel, DEFAULT_LEVEL_THRESHOLDS } from '@/lib/pet';

// ─── Types ──────────────────────────────────────────────
export type PetClass = {
  id: string;
  name: string;
  status: 'active' | 'archived';
  levelThresholds: number[];
  scoringRules: ScoringRule[];
  shopItems: ShopItem[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type ScoringRule = { label: string; value: number };
export type ShopItem = { name: string; cost: number; stock: number };

export type PetStudent = {
  id: string;
  classId: string;
  name: string;
  accessToken: string;
  petType: string | null;
  foodCount: number;
  level: number;
  badgeCount: number;
  score: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
};

export type PetHistory = {
  id: string;
  classId: string;
  studentId: string;
  action: string;
  amount: number;
  note: string;
  createdAt: string;
};

// ─── Row mappers ────────────────────────────────────────
function mapClass(row: Record<string, unknown>): PetClass {
  return {
    id: row.id as string,
    name: row.name as string,
    status: row.status as 'active' | 'archived',
    levelThresholds: (row.level_thresholds ?? DEFAULT_LEVEL_THRESHOLDS) as number[],
    scoringRules: (row.scoring_rules ?? []) as ScoringRule[],
    shopItems: (row.shop_items ?? []) as ShopItem[],
    notes: (row.notes ?? '') as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string
  };
}

function mapStudent(row: Record<string, unknown>): PetStudent {
  return {
    id: row.id as string,
    classId: row.class_id as string,
    name: row.name as string,
    accessToken: row.access_token as string,
    petType: (row.pet_type ?? null) as string | null,
    foodCount: (row.food_count ?? 0) as number,
    level: (row.level ?? 1) as number,
    badgeCount: (row.badge_count ?? 0) as number,
    score: (row.score ?? 0) as number,
    status: row.status as 'active' | 'archived',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string
  };
}

function mapHistory(row: Record<string, unknown>): PetHistory {
  return {
    id: row.id as string,
    classId: row.class_id as string,
    studentId: row.student_id as string,
    action: row.action as string,
    amount: (row.amount ?? 0) as number,
    note: (row.note ?? '') as string,
    createdAt: row.created_at as string
  };
}

// ─── Error helpers ──────────────────────────────────────
export function isPetTableMissingError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return /pet_classes|pet_students|pet_history/.test(err.message) && /42P01|does not exist|relation/.test(err.message);
}

// ─── Class CRUD ─────────────────────────────────────────
export async function listPetClasses(opts?: { status?: 'all' | 'active' | 'archived' }): Promise<PetClass[]> {
  const status = opts?.status ?? 'active';
  const qs = status === 'all' ? 'order=created_at.desc' : `status=eq.${status}&order=created_at.desc`;
  const res = await supabaseAdminRequest(buildTablePath('pet_classes', qs));
  if (!res) return [];
  return ((await res.json()) as Record<string, unknown>[]).map(mapClass);
}

export async function getPetClass(id: string): Promise<PetClass | null> {
  const res = await supabaseAdminRequest(buildTablePath('pet_classes', `id=eq.${id}`));
  if (!res) return null;
  const rows = (await res.json()) as Record<string, unknown>[];
  return rows.length > 0 ? mapClass(rows[0]) : null;
}

export async function createPetClass(data: { name: string; notes?: string }): Promise<PetClass | null> {
  const res = await supabaseAdminRequest(buildTablePath('pet_classes'), {
    method: 'POST',
    body: JSON.stringify({ name: data.name, notes: data.notes ?? '' }),
    headers: { Prefer: 'return=representation' }
  });
  if (!res) return null;
  const rows = (await res.json()) as Record<string, unknown>[];
  return rows.length > 0 ? mapClass(rows[0]) : null;
}

export async function updatePetClass(
  id: string,
  data: Partial<{
    name: string;
    status: string;
    levelThresholds: number[];
    scoringRules: ScoringRule[];
    shopItems: ShopItem[];
    notes: string;
  }>
): Promise<void> {
  const body: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.name !== undefined) body.name = data.name;
  if (data.status !== undefined) body.status = data.status;
  if (data.levelThresholds !== undefined) body.level_thresholds = data.levelThresholds;
  if (data.scoringRules !== undefined) body.scoring_rules = data.scoringRules;
  if (data.shopItems !== undefined) body.shop_items = data.shopItems;
  if (data.notes !== undefined) body.notes = data.notes;
  await supabaseAdminRequest(buildTablePath('pet_classes', `id=eq.${id}`), {
    method: 'PATCH',
    body: JSON.stringify(body)
  });
}

export async function deletePetClass(id: string): Promise<void> {
  await supabaseAdminRequest(buildTablePath('pet_classes', `id=eq.${id}`), { method: 'DELETE' });
}

// ─── Student CRUD ───────────────────────────────────────
export async function listPetStudents(classId: string): Promise<PetStudent[]> {
  const res = await supabaseAdminRequest(buildTablePath('pet_students', `class_id=eq.${classId}&order=created_at.asc`));
  if (!res) return [];
  return ((await res.json()) as Record<string, unknown>[]).map(mapStudent);
}

export async function getPetStudent(id: string): Promise<PetStudent | null> {
  const res = await supabaseAdminRequest(buildTablePath('pet_students', `id=eq.${id}`));
  if (!res) return null;
  const rows = (await res.json()) as Record<string, unknown>[];
  return rows.length > 0 ? mapStudent(rows[0]) : null;
}

export async function getPetStudentByToken(token: string): Promise<PetStudent | null> {
  const res = await supabaseAdminRequest(buildTablePath('pet_students', `access_token=eq.${encodeURIComponent(token)}`));
  if (!res) return null;
  const rows = (await res.json()) as Record<string, unknown>[];
  return rows.length > 0 ? mapStudent(rows[0]) : null;
}

export async function createPetStudent(data: { classId: string; name: string }): Promise<PetStudent | null> {
  const res = await supabaseAdminRequest(buildTablePath('pet_students'), {
    method: 'POST',
    body: JSON.stringify({ class_id: data.classId, name: data.name }),
    headers: { Prefer: 'return=representation' }
  });
  if (!res) return null;
  const rows = (await res.json()) as Record<string, unknown>[];
  return rows.length > 0 ? mapStudent(rows[0]) : null;
}

export async function createPetStudentsBatch(classId: string, names: string[]): Promise<PetStudent[]> {
  if (names.length === 0) return [];
  const body = names.map((name) => ({ class_id: classId, name }));
  const res = await supabaseAdminRequest(buildTablePath('pet_students'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { Prefer: 'return=representation' }
  });
  if (!res) return [];
  return ((await res.json()) as Record<string, unknown>[]).map(mapStudent);
}

export async function updatePetStudent(id: string, data: Partial<{ name: string; petType: string | null; status: string }>): Promise<void> {
  const body: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.name !== undefined) body.name = data.name;
  if (data.petType !== undefined) body.pet_type = data.petType;
  if (data.status !== undefined) body.status = data.status;
  await supabaseAdminRequest(buildTablePath('pet_students', `id=eq.${id}`), {
    method: 'PATCH',
    body: JSON.stringify(body)
  });
}

export async function deletePetStudent(id: string): Promise<void> {
  await supabaseAdminRequest(buildTablePath('pet_students', `id=eq.${id}`), { method: 'DELETE' });
}

// ─── Feeding ────────────────────────────────────────────
export async function feedStudents(
  classId: string,
  entries: { studentId: string; amount: number }[],
  levelThresholds: number[]
): Promise<void> {
  if (entries.length === 0) return;

  // Get current student data
  const students = await listPetStudents(classId);
  const studentMap = new Map(students.map((s) => [s.id, s]));

  for (const entry of entries) {
    const student = studentMap.get(entry.studentId);
    if (!student) continue;

    const newFood = student.foodCount + entry.amount;
    const newLevel = computeLevel(newFood, levelThresholds);

    // Update student
    await supabaseAdminRequest(buildTablePath('pet_students', `id=eq.${entry.studentId}`), {
      method: 'PATCH',
      body: JSON.stringify({
        food_count: newFood,
        level: newLevel,
        updated_at: new Date().toISOString()
      })
    });

    // Record history
    await supabaseAdminRequest(buildTablePath('pet_history'), {
      method: 'POST',
      body: JSON.stringify({
        class_id: classId,
        student_id: entry.studentId,
        action: 'feed',
        amount: entry.amount,
        note: `+${entry.amount} 食物`
      })
    });
  }
}

// ─── Scoring ────────────────────────────────────────────
export async function scoreStudent(classId: string, studentId: string, amount: number, note: string): Promise<void> {
  // Get current student
  const student = await getPetStudent(studentId);
  if (!student) return;

  await supabaseAdminRequest(buildTablePath('pet_students', `id=eq.${studentId}`), {
    method: 'PATCH',
    body: JSON.stringify({
      score: student.score + amount,
      updated_at: new Date().toISOString()
    })
  });

  await supabaseAdminRequest(buildTablePath('pet_history'), {
    method: 'POST',
    body: JSON.stringify({
      class_id: classId,
      student_id: studentId,
      action: 'score',
      amount,
      note
    })
  });
}

// ─── Graduation (earn badge) ────────────────────────────
export async function graduateStudent(classId: string, studentId: string, levelThresholds: number[]): Promise<boolean> {
  const student = await getPetStudent(studentId);
  if (!student || student.level < levelThresholds.length) return false;

  await supabaseAdminRequest(buildTablePath('pet_students', `id=eq.${studentId}`), {
    method: 'PATCH',
    body: JSON.stringify({
      badge_count: student.badgeCount + 1,
      food_count: 0,
      level: 1,
      pet_type: null,
      updated_at: new Date().toISOString()
    })
  });

  await supabaseAdminRequest(buildTablePath('pet_history'), {
    method: 'POST',
    body: JSON.stringify({
      class_id: classId,
      student_id: studentId,
      action: 'graduate',
      amount: 1,
      note: `完成养成，获得第 ${student.badgeCount + 1} 枚徽章`
    })
  });

  return true;
}

// ─── Exchange (shop) ────────────────────────────────────
export async function exchangeItem(classId: string, studentId: string, itemName: string, cost: number): Promise<boolean> {
  const student = await getPetStudent(studentId);
  if (!student || student.badgeCount < cost) return false;

  await supabaseAdminRequest(buildTablePath('pet_students', `id=eq.${studentId}`), {
    method: 'PATCH',
    body: JSON.stringify({
      badge_count: student.badgeCount - cost,
      updated_at: new Date().toISOString()
    })
  });

  await supabaseAdminRequest(buildTablePath('pet_history'), {
    method: 'POST',
    body: JSON.stringify({
      class_id: classId,
      student_id: studentId,
      action: 'exchange',
      amount: -cost,
      note: `兑换: ${itemName}`
    })
  });

  return true;
}

// ─── History ────────────────────────────────────────────
export async function listPetHistory(opts: { classId?: string; studentId?: string; limit?: number }): Promise<PetHistory[]> {
  const filters: string[] = [];
  if (opts.classId) filters.push(`class_id=eq.${opts.classId}`);
  if (opts.studentId) filters.push(`student_id=eq.${opts.studentId}`);
  filters.push('order=created_at.desc');
  if (opts.limit) filters.push(`limit=${opts.limit}`);

  const res = await supabaseAdminRequest(buildTablePath('pet_history', filters.join('&')));
  if (!res) return [];
  return ((await res.json()) as Record<string, unknown>[]).map(mapHistory);
}

// ─── Stats ──────────────────────────────────────────────
export async function getPetClassStats(classId: string): Promise<{ studentCount: number; avgLevel: number; totalFood: number }> {
  const students = await listPetStudents(classId);
  const active = students.filter((s) => s.status === 'active');
  const totalFood = active.reduce((sum, s) => sum + s.foodCount, 0);
  const avgLevel = active.length > 0 ? active.reduce((sum, s) => sum + s.level, 0) / active.length : 0;
  return { studentCount: active.length, avgLevel: Math.round(avgLevel * 10) / 10, totalFood };
}
