import { Navigate } from 'react-router-dom';
import { useStudent } from '@/context/StudentContext';
import LeaveBudget from '@/components/leaves/LeaveBudget';
import LeaveCalendar from '@/components/leaves/LeaveCalendar';
import LeaveSuggester from '@/components/leaves/LeaveSuggester';
import LeaveRangePlanner from '@/components/leaves/LeaveRangePlanner';
import { Copy, Printer, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { copyToClipboard } from '@/lib/share';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';

export default function Leaves() {
  const { profile, plannedLeaves, setPlannedLeaves, sectionKey } = useStudent();
  const { showToast } = useToast();

  if (!profile) return <Navigate to="/select" replace />;

  const handleCopyPlan = async () => {
    const lines = [
      'Attendify Leave Plan',
      `Name: ${profile.name} (${profile.rollNumber})`,
      `Section: ${sectionKey}`,
      `Planned leave dates: ${plannedLeaves.length > 0 ? plannedLeaves.join(', ') : 'None'}`,
    ];
    await copyToClipboard(lines.join('\n'));
    showToast('Leave plan copied to clipboard', 'success');
  };

  const handleClearLeaves = () => {
    setPlannedLeaves([]);
    showToast('All planned leaves cleared', 'info');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">Leave Tracker</h1>
          <p className="text-slate-400 text-sm mt-1">Plan your leaves and see the impact in real time</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={handleCopyPlan}>
            <Copy className="w-3.5 h-3.5" /> Copy leave plan
          </Button>
          <Button size="sm" variant="secondary" onClick={() => window.print()}>
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </Button>
          <Button size="sm" variant="ghost" onClick={handleClearLeaves}>
            <Trash2 className="w-3.5 h-3.5" /> Clear all planned leaves
          </Button>
        </div>
      </div>

      {plannedLeaves.length > 0 && (
        <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <span className="text-sm text-amber-200">
            You have <strong>{plannedLeaves.length}</strong> planned leave day{plannedLeaves.length > 1 ? 's' : ''}: {plannedLeaves.join(', ')}
          </span>
        </div>
      )}

      <LeaveBudget />
      <LeaveCalendar />
      <LeaveSuggester />
      <LeaveRangePlanner />
      <ChatbotWidget />
    </div>
  );
}
