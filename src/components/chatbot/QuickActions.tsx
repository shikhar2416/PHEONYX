interface QuickActionsProps {
  actions: string[];
  onAction: (text: string) => void;
}

export default function QuickActions({ actions, onAction }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 px-1">
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={() => onAction(action)}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white hover:border-emerald-400/20 transition-all whitespace-nowrap"
        >
          {action}
        </button>
      ))}
    </div>
  );
}
