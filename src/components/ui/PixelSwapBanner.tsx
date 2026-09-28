import { CalendarCheck, Sparkles, DoorOpen, TrendingUp } from "lucide-react";
import PixelSwap from "./PixelSwap";

export default function PixelSwapBanner() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
      <PixelSwap
        firstContent={
          <div className="flex items-center justify-center gap-3 w-full h-full px-6 py-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <CalendarCheck className="w-5 h-5 text-base-900" strokeWidth={2.5} />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-heading font-bold text-sm sm:text-base text-white">
                Track your attendance with precision
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Hover to see what's new — Free Class Locator is here
              </p>
            </div>
          </div>
        }
        secondContent={
          <div className="flex items-center justify-center gap-3 w-full h-full px-6 py-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 flex-shrink-0">
              <DoorOpen className="w-5 h-5 text-base-900" strokeWidth={2.5} />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-heading font-bold text-sm sm:text-base text-white">
                Find free classrooms instantly
              </p>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 justify-center sm:justify-start">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Live room availability · Heatmap · Smart suggestions
                <TrendingUp className="w-3 h-3 text-cyan-400" />
              </p>
            </div>
          </div>
        }
        pixelSize={48}
        gap={2}
        pixelRadius={15}
        pixelScale={0.3}
        duration={1200}
        pixelDuration={400}
        pattern="center"
        randomness={0.2}
        pixelSpin={90}
        fade
        trigger="hover"
        aspectRatio="auto"
        className="rounded-2xl glass-card bg-white/5 border border-white/10 hover:border-emerald-400/20 transition-colors"
        style={{ height: "72px" }}
      />
    </div>
  );
}
