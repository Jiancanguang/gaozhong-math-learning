'use server';

import { revalidatePath } from 'next/cache';

import { exchangeItem, getPetClass, getPetStudentByToken, graduateStudent, updatePetStudent } from '@/lib/pet-store';

export async function choosePetAction(formData: FormData) {
  const token = formData.get('token') as string;
  const petType = formData.get('petType') as string;
  if (!token || !petType) return;

  const student = await getPetStudentByToken(token);
  if (!student) return;

  // Only allow choosing if no pet assigned yet
  if (student.petType) return;

  await updatePetStudent(student.id, { petType });
  revalidatePath(`/pet/${token}`);
}

export async function graduateAction(formData: FormData) {
  const token = formData.get('token') as string;
  if (!token) return;

  const student = await getPetStudentByToken(token);
  if (!student) return;

  const cls = await getPetClass(student.classId);
  if (!cls) return;

  await graduateStudent(student.classId, student.id, cls.levelThresholds);
  revalidatePath(`/pet/${token}`);
}

export async function exchangeAction(formData: FormData) {
  const token = formData.get('token') as string;
  const itemName = formData.get('itemName') as string;
  const cost = Number(formData.get('cost'));
  if (!token || !itemName || !cost) return;

  const student = await getPetStudentByToken(token);
  if (!student) return;

  await exchangeItem(student.classId, student.id, itemName, cost);
  revalidatePath(`/pet/${token}`);
}
