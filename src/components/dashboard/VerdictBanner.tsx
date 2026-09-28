import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';
import { type EngineResult } from '@/lib/engine';
import { fmtPct } from '@/lib/format';

interface VerdictBannerProps {
  result: EngineResult;
}

export default function VerdictBanner({ result }: VerdictBannerProps) {
  const { worstStatus, aggregate } = result;

  if (worstStatus === 'IMPOSSIBLE') {
    const impossibleSubjects = result.subjects.filter((s) => s.status75 === 'IMPOSSIBLE');
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-rose-500/10 border-2 border-rose-500/50 rounded-2xl p-6 animate-pulse-border animate-shake-in"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-7 h-7 text-rose-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold font-heading text-rose-300 mb-2">
              IRREVERSIBLE DETENTION
            </h2>
            <p className="text-sm text-rose-200 leading-relaxed mb-3">
              Even if you attend every remaining class this semester, you cannot reach 75% attendance
              {impossibleSubjects.length > 1 ? ` in ${impossibleSubjects.length} subjects` : ` in ${impossibleSubjects[0]?.name ?? 'a subject'}`}.
            </p>
            <div className="space-y-1.5">
              {impossibleSubjects.map((s) => (
                <div key={s.code} className="text-xs text-rose-300/80 font-mono">
                  {s.name}: need {s.needed75} of {s.remaining} remaining (max possible: {fmtPct(s.maxPossiblePct)})
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (worstStatus === 'AT_RISK') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-amber-500/10 border border-amber-500/40 rounded-2xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-heading text-amber-300 mb-1">
              DANGER ZONE — ACTION NEEDED
            </h2>
            <p className="text-sm text-amber-200 leading-relaxed">
              You're below or near the 75% line. Attend{' '}
              <span className="font-bold text-amber-100">{aggregate.clampedNeeded75}</span> of{' '}
              <span className="font-bold text-amber-100">{aggregate.remaining}</span> remaining classes
              to stay safe. Current: {fmtPct(aggregate.currentPct)}.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-6"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-7 h-7 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-heading text-emerald-300 mb-1">
            YOU'RE SAFE
          </h2>
          <p className="text-sm text-emerald-200 leading-relaxed">
            Your attendance is above 75% across all subjects. You can bunk{' '}
            <span className="font-bold text-emerald-100">{aggregate.bunksAllowed75}</span> more classes
            and still stay safe. Current: {fmtPct(aggregate.currentPct)}.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
