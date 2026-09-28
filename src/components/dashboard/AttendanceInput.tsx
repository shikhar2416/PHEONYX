import { Info, Wand2, Database } from 'lucide-react';
import SegmentedControl from '@/components/ui/SegmentedControl';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Pill from '@/components/ui/Pill';
import { type SubjectInput, getDemoInputs } from '@/lib/engine';
import { SECTIONS } from '@/data/timetables';
import { type AttendanceStatus } from '@/lib/engine';
import { fmtPct } from '@/lib/format';

interface AttendanceInputProps {
  sectionKey: string;
  mode: 'quick' | 'precise';
  onModeChange: (mode: 'quick' | 'precise') => void;
  inputs: SubjectInput[];
  onInputsChange: (inputs: SubjectInput[]) => void;
  fillAllPct: number;
  onFillAllPctChange: (n: number) => void;
}

export default function AttendanceInput({
  sectionKey,
  mode,
  onModeChange,
  inputs,
  onInputsChange,
  fillAllPct,
  onFillAllPctChange,
}: AttendanceInputProps) {
  const section = SECTIONS[sectionKey];
  if (!section) return null;

  const updateInput = (code: string, patch: Partial<SubjectInput>) => {
    onInputsChange(inputs.map((inp) => (inp.code === code ? { ...inp, ...patch } : inp)));
  };

  const handleQuickChange = (code: string, pctStr: string) => {
    const pct = parseFloat(pctStr);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      updateInput(code, { attended: NaN as any });
      return;
    }
    const c = inputs.find((i) => i.code === code)?.conducted ?? 0;
    const a = Math.round((pct / 100) * c);
    updateInput(code, { attended: a });
  };

  const fillAll = () => {
    onInputsChange(
      inputs.map((inp) => ({
        ...inp,
        attended: Math.round((fillAllPct / 100) * (inp.conducted || 1)),
      })),
    );
  };

  const loadDemo = () => {
    onInputsChange(getDemoInputs(sectionKey, new Date().toISOString().slice(0, 10)));
  };

  const getPct = (inp: SubjectInput): number | null => {
    if (inp.conducted === 0) return null;
    return (inp.attended / inp.conducted) * 100;
  };

  const getStatus = (inp: SubjectInput): AttendanceStatus => {
    const pct = getPct(inp);
    if (pct === null) return 'AT_RISK';
    if (pct >= 90) return 'SAFE';
    if (pct >= 75) return 'AT_RISK';
    return 'IMPOSSIBLE';
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-1">
            Enter your attendance
          </h2>
          <p className="text-slate-400 text-sm">
            {section.label} · {section.venue}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            options={[
              { value: 'quick', label: 'Quick' },
              { value: 'precise', label: 'Precise' },
            ]}
            value={mode}
            onChange={(v) => onModeChange(v as 'quick' | 'precise')}
          />
        </div>
      </div>

      {mode === 'quick' && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="text-xs text-cyan-200 flex-1">
            C auto-derived from your section's timetable — switch to Precise mode for exact numbers.
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {mode === 'quick' && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={fillAllPct}
              onChange={(e) => onFillAllPctChange(parseFloat(e.target.value) || 0)}
              className="w-20"
              label=""
            />
            <Button size="sm" variant="secondary" onClick={fillAll}>
              <Wand2 className="w-3.5 h-3.5" />
              Fill all with {fillAllPct}%
            </Button>
          </div>
        )}
        <Button size="sm" variant="ghost" onClick={loadDemo}>
          <Database className="w-3.5 h-3.5" />
          Load demo data
        </Button>
      </div>

      <div className="space-y-3">
        {inputs.map((inp) => {
          const slot = Object.values(section.slots).find((s) => s.code === inp.code);
          if (!slot) return null;
          const pct = getPct(inp);
          const status = getStatus(inp);
          const pctStr = pct !== null ? pct.toFixed(1) : '';

          return (
            <div
              key={inp.code}
              className="glass-card bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                    {inp.code}
                  </span>
                  <Pill type={status} className="text-[10px]" />
                </div>
                <p className="text-sm text-white font-medium truncate">{slot.name}</p>
                <p className="text-xs text-slate-500">
                  Credits: {slot.credits} · {inp.conducted} conducted so far
                </p>
              </div>

              {mode === 'quick' ? (
                <div className="flex items-center gap-3">
                  <div className="w-28">
                    <Input
                      type="number"
                      value={pctStr || ''}
                      onChange={(e) => handleQuickChange(inp.code, e.target.value)}
                      placeholder="0-100"
                      className="text-center"
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-12 text-right">
                    = {inp.attended}/{inp.conducted}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-20">
                    <Input
                      type="number"
                      value={Number.isNaN(inp.attended) ? '' : inp.attended}
                      onChange={(e) =>
                        updateInput(inp.code, { attended: parseInt(e.target.value) || 0 })
                      }
                      placeholder="A"
                      className="text-center"
                    />
                  </div>
                  <span className="text-slate-500 text-sm">/</span>
                  <div className="w-20">
                    <Input
                      type="number"
                      value={inp.conducted}
                      onChange={(e) =>
                        updateInput(inp.code, { conducted: parseInt(e.target.value) || 0 })
                      }
                      placeholder="C"
                      className="text-center"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {inputs.some((i) => i.conducted === 0) && (
        <div className="text-xs text-amber-400 text-center">
          Some subjects have no classes conducted yet — attendance will show as "—" until classes begin.
        </div>
      )}
    </div>
  );
}
