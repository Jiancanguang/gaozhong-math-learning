import { requireTeacherAuth } from '@/components/growth-tracker/auth-gate';
import { GrowthTrackerNav } from '@/components/growth-tracker/nav';

export const dynamic = 'force-dynamic';

export default async function GrowthTrackerLayout({ children }: { children: React.ReactNode }) {
  await requireTeacherAuth();

  return (
    <div className="min-h-screen bg-paper">
      <GrowthTrackerNav />
      <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
