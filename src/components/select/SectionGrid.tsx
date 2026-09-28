import { useState, useMemo } from 'react';
import { SECTIONS, SECTION_KEYS } from '@/data/timetables';
import SectionCard from './SectionCard';
import SearchFilter from './SearchFilter';

interface SectionGridProps {
  onSelect: (key: string) => void;
}

export default function SectionGrid({ onSelect }: SectionGridProps) {
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');

  const departments = useMemo(() => {
    const set = new Set<string>();
    for (const s of Object.values(SECTIONS)) set.add(s.department);
    return Array.from(set).sort();
  }, []);

  const grouped = useMemo(() => {
    const filtered = SECTION_KEYS.filter((key) => {
      const s = SECTIONS[key];
      if (department && s.department !== department) return false;
      if (query) {
        const q = query.toLowerCase();
        const matchKey = key.toLowerCase().includes(q);
        const matchLabel = s.label.toLowerCase().includes(q);
        const matchVenue = s.venue.toLowerCase().includes(q);
        const matchSubject = Object.values(s.slots).some(
          (sl) => sl.name.toLowerCase().includes(q) || sl.code.toLowerCase().includes(q),
        );
        return matchKey || matchLabel || matchVenue || matchSubject;
      }
      return true;
    });
    const byYear: Record<number, string[]> = {};
    for (const key of filtered) {
      const year = SECTIONS[key].year;
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(key);
    }
    return byYear;
  }, [query, department]);

  const yearLabels: Record<number, string> = {
    1: 'I Year', 2: 'II Year', 3: 'III Year', 4: 'IV Year',
  };
  const sortedYears = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <SearchFilter
        query={query}
        onQueryChange={setQuery}
        department={department}
        onDepartmentChange={setDepartment}
        departments={departments}
      />

      {sortedYears.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          No sections match your search.
        </div>
      )}

      {sortedYears.map((year) => (
        <div key={year}>
          <h3 className="font-heading font-semibold text-white text-sm mb-3 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-emerald-400" />
            {yearLabels[year] || `Year ${year}`}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped[year].map((key, i) => (
              <SectionCard
                key={key}
                sectionKey={key}
                section={SECTIONS[key]}
                onSelect={onSelect}
                index={i}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
