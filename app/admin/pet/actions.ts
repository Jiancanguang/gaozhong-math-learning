'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { isAdminAuthorized } from '@/lib/admin-auth';
import {
  createPetClass,
  createPetStudentsBatch,
  deletePetClass,
  deletePetStudent,
  feedStudents,
  getPetClass,
  scoreStudent,
  updatePetClass,
  updatePetStudent
} from '@/lib/pet-store';
import type { ShopItem, ScoringRule } from '@/lib/pet-store';

function assertAdmin() {
  if (!isAdminAuthorized()) throw new Error('Unauthorized');
}

export async function createClassAction(formData: FormData) {
  assertAdmin();
  const name = formData.get('name') as string;
  if (!name?.trim()) return;
  const cls = await createPetClass({ name: name.trim() });
  if (cls) redirect(`/admin/pet/${cls.id}`);
}

export async function deleteClassAction(formData: FormData) {
  assertAdmin();
  const id = formData.get('id') as string;
  if (!id) return;
  await deletePetClass(id);
  revalidatePath('/admin/pet');
}

export async function updateClassSettingsAction(formData: FormData) {
  assertAdmin();
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const thresholdsRaw = formData.get('thresholds') as string;
  const scoringRulesRaw = formData.get('scoringRules') as string;
  const shopItemsRaw = formData.get('shopItems') as string;

  if (!id) return;

  const data: Parameters<typeof updatePetClass>[1] = {};
  if (name?.trim()) data.name = name.trim();

  if (thresholdsRaw) {
    try {
      data.levelThresholds = JSON.parse(thresholdsRaw);
    } catch { /* ignore */ }
  }
  if (scoringRulesRaw) {
    try {
      data.scoringRules = JSON.parse(scoringRulesRaw) as ScoringRule[];
    } catch { /* ignore */ }
  }
  if (shopItemsRaw) {
    try {
      data.shopItems = JSON.parse(shopItemsRaw) as ShopItem[];
    } catch { /* ignore */ }
  }

  await updatePetClass(id, data);
  revalidatePath(`/admin/pet/${id}`);
}

export async function addStudentsAction(formData: FormData) {
  assertAdmin();
  const classId = formData.get('classId') as string;
  const namesRaw = formData.get('names') as string;
  if (!classId || !namesRaw) return;

  const names = namesRaw
    .split(/[\n,，、]/)
    .map((n) => n.trim())
    .filter(Boolean);

  if (names.length === 0) return;
  await createPetStudentsBatch(classId, names);
  revalidatePath(`/admin/pet/${classId}`);
}

export async function deleteStudentAction(formData: FormData) {
  assertAdmin();
  const id = formData.get('id') as string;
  const classId = formData.get('classId') as string;
  if (!id || !classId) return;
  await deletePetStudent(id);
  revalidatePath(`/admin/pet/${classId}`);
}

export async function updateStudentPetAction(formData: FormData) {
  assertAdmin();
  const id = formData.get('id') as string;
  const classId = formData.get('classId') as string;
  const petType = formData.get('petType') as string;
  if (!id || !classId) return;
  await updatePetStudent(id, { petType: petType || null });
  revalidatePath(`/admin/pet/${classId}`);
}

export async function batchFeedAction(formData: FormData) {
  assertAdmin();
  const classId = formData.get('classId') as string;
  const entriesRaw = formData.get('entries') as string;
  if (!classId || !entriesRaw) return;

  const cls = await getPetClass(classId);
  if (!cls) return;

  try {
    const entries = JSON.parse(entriesRaw) as { studentId: string; amount: number }[];
    await feedStudents(classId, entries, cls.levelThresholds);
  } catch { /* ignore */ }

  revalidatePath(`/admin/pet/${classId}`);
}

export async function scoreStudentAction(formData: FormData) {
  assertAdmin();
  const classId = formData.get('classId') as string;
  const studentId = formData.get('studentId') as string;
  const amount = Number(formData.get('amount'));
  const note = (formData.get('note') as string) || '';
  if (!classId || !studentId || !amount) return;
  await scoreStudent(classId, studentId, amount, note);
  revalidatePath(`/admin/pet/${classId}`);
}
