import { useState } from 'react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { MoreHorizontal, ListTodo, StickyNote, CheckCircle, Clock, ChevronDown } from 'lucide-react';
import { type Flag } from './mock-data';
import { useWorkflow } from './WorkflowContext';
import { LogNoteModal, NewTodoModal } from './ActionModals';

interface FlagActionDropdownProps {
  flag: Flag;
  variant?: 'icon' | 'button';
}

export function FlagActionDropdown({ flag, variant = 'icon' }: FlagActionDropdownProps) {
  const { convertFlagToTodo, markFlagActioned, snoozeFlag } = useWorkflow();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {variant === 'icon' ? (
            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Flag actions">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          ) : (
            <button className="text-[11px] px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-1.5">
              Take Action <ChevronDown className="w-3 h-3" />
            </button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[220px]">
          <DropdownMenuItem onClick={() => setShowTodoModal(true)} className="gap-2 text-[13px]">
            <ListTodo className="w-4 h-4 text-emerald-500" />
            Convert to To-Do
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowNoteModal(true)} className="gap-2 text-[13px]">
            <StickyNote className="w-4 h-4 text-blue-500" />
            Log Note & Resolve
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => markFlagActioned(flag.id)} className="gap-2 text-[13px]">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Mark Resolved
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => snoozeFlag(flag.id)} className="gap-2 text-[13px]">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Snooze 7 days
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LogNoteModal
        open={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        companyName={flag.companyName}
        companyId={flag.companyId}
        prefillContent={`Re: ${flag.headline}\n\n`}
        prefillTag="Call Note"
        onSaved={() => markFlagActioned(flag.id)}
      />

      <NewTodoModal
        open={showTodoModal}
        onClose={() => {
          setShowTodoModal(false);
          convertFlagToTodo(flag.id);
        }}
        companyName={flag.companyName}
        prefillTitle={flag.suggestedAction || flag.headline}
        prefillPriority={flag.urgency === 'high' ? 'high' : flag.urgency === 'medium' ? 'medium' : 'low'}
        source="flag"
      />
    </>
  );
}
