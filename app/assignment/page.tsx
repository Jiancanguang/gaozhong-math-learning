import { AssignmentBuilder } from '@/components/assignment-builder';
import { getAllCourses } from '@/lib/courses';

export default function AssignmentPage() {
  const courses = getAllCourses();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <AssignmentBuilder courses={courses} />
    </div>
  );
}
