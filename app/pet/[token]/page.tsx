import { notFound } from 'next/navigation';

import { StudentPetView } from '@/components/pet/student-pet-view';
import { getPetClass, getPetStudentByToken, listPetHistory } from '@/lib/pet-store';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: { token: string };
};

export default async function StudentPetPage({ params }: PageProps) {
  const student = await getPetStudentByToken(params.token);
  if (!student) notFound();

  const cls = await getPetClass(student.classId);
  if (!cls) notFound();

  const history = await listPetHistory({ studentId: student.id, limit: 30 });

  return <StudentPetView student={student} petClass={cls} history={history} token={params.token} />;
}
