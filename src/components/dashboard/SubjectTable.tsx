import SubjectCard from './SubjectCard';
import { type SubjectResult } from '@/lib/engine';

interface SubjectTableProps {
  subjects: SubjectResult[];
}

export default function SubjectTable({ subjects }: SubjectTableProps) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {subjects.map((s) => (
        <SubjectCard key={s.code} subject={s} />
      ))}
    </div>
  );
}
