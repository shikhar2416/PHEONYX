import { Search, Filter } from 'lucide-react';

interface SearchFilterProps {
  query: string;
  onQueryChange: (q: string) => void;
  department: string;
  onDepartmentChange: (d: string) => void;
  departments: string[];
}

export default function SearchFilter({ query, onQueryChange, department, onDepartmentChange, departments }: SearchFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by section, venue, or subject..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:border-emerald-400/50 focus:bg-white/10 transition-colors"
        />
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
        <button
          onClick={() => onDepartmentChange('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            department === '' ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
          }`}
        >
          All
        </button>
        {departments.map((d) => (
          <button
            key={d}
            onClick={() => onDepartmentChange(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              department === d ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
