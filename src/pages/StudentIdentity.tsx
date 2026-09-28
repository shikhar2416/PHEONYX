import { useParams, Navigate } from 'react-router-dom';
import StudentForm from '@/components/student/StudentForm';
import { SECTIONS } from '@/data/timetables';

export default function StudentIdentity() {
  const { sectionKey } = useParams<{ sectionKey: string }>();
  const decodedKey = sectionKey ? decodeURIComponent(sectionKey) : '';

  if (!decodedKey || !SECTIONS[decodedKey]) {
    return <Navigate to="/select" replace />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 min-h-[60vh] flex items-center justify-center">
      <StudentForm sectionKey={decodedKey} />
    </div>
  );
}
