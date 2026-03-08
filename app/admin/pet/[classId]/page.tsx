import { notFound } from 'next/navigation';

import { renderPetAdminGate, PetAdminErrorBanner } from '@/components/pet/admin-access';
import { PetClassManager } from '@/components/pet/class-manager';
import { getPetClass, isPetTableMissingError, listPetStudents, listPetHistory } from '@/lib/pet-store';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: { classId: string };
  searchParams?: { error?: string | string[]; tab?: string | string[] };
};

export default async function PetClassDetailPage({ params, searchParams }: PageProps) {
  const error = Array.isArray(searchParams?.error) ? searchParams.error[0] : searchParams?.error;
  const tab = Array.isArray(searchParams?.tab) ? searchParams.tab[0] : searchParams?.tab;

  const gate = renderPetAdminGate({ successPath: `/admin/pet/${params.classId}`, searchError: error });
  if (gate) return gate;

  try {
    const cls = await getPetClass(params.classId);
    if (!cls) notFound();

    const [students, history] = await Promise.all([
      listPetStudents(params.classId),
      listPetHistory({ classId: params.classId, limit: 50 })
    ]);

    return (
      <div>
        <PetAdminErrorBanner error={error} />
        <PetClassManager petClass={cls} students={students} history={history} initialTab={tab} />
      </div>
    );
  } catch (fetchError) {
    if (isPetTableMissingError(fetchError)) {
      return (
        <div>
          <PetAdminErrorBanner error="missing-table" />
        </div>
      );
    }
    throw fetchError;
  }
}
