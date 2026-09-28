import { useState, useMemo } from 'react';
import { Wand2, Check, X } from 'lucide-react';
import { suggestSafeLeaves } from '@/lib/leaves';
import { todayISO, formatShort } from '@/lib/dates';
import { useStudent } from '@/context/StudentContext';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';

export default function LeaveSuggester() {
  const { inputs, sectionKey, plannedLeaves, setPlannedLeaves } = useStudent();
  const { showToast } = useToast();
  const today = todayISO();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestionsList = useMemo(
    () => suggestSafeLeaves(inputs, sectionKey, today, plannedLeaves),
    [inputs, sectionKey, today, plannedLeaves],
  );

  const handleSuggest = () => {
    setSuggestions(suggestionsList);
    setShowSuggestions(true);
    if (suggestionsList.length === 0) {
      showToast('No safe leaves available — you need to attend everything!', 'info');
    } else {
      showToast(`Found ${suggestionsList.length} safe leave days`, 'success');
    }
  };

  const handleApply = () => {
    setPlannedLeaves([...plannedLeaves, ...suggestions]);
    setShowSuggestions(false);
    setSuggestions([]);
    showToast(`Applied ${suggestionsList.length} leave suggestions`, 'success');
  };

  return (
    <div className="glass-card bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading font-semibold text-white text-sm">Safe Leave Suggester</h3>
          <p className="text-xs text-slate-400 mt-0.5">Auto-picks the maximum set of classes you can skip</p>
        </div>
        <Button size="sm" variant="secondary" onClick={handleSuggest}>
          <Wand2 className="w-3.5 h-3.5" />
          Suggest safe leaves
        </Button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            {suggestions.map((iso) => (
              <div key={iso} className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                <span className="text-sm text-emerald-200">{formatShort(iso)}</span>
                <span className="text-xs text-slate-500">{getDayNameShort(iso)}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleApply}>
              <Check className="w-3.5 h-3.5" />
              Apply suggestion ({suggestions.length} days)
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowSuggestions(false)}>
              <X className="w-3.5 h-3.5" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && (
        <div className="text-center py-6 text-sm text-slate-500">
          No safe leaves available right now. Attend more classes first!
        </div>
      )}
    </div>
  );
}

function getDayNameShort(iso: string): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date(iso).getDay()];
}
