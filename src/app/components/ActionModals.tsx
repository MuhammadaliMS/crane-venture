import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from './ui/dialog';
import { StickyNote, ListTodo, Phone, Calendar, X } from 'lucide-react';
import { companies, currentUser } from './mock-data';
import { useWorkflow } from './WorkflowContext';

// ========================================
// LOG NOTE MODAL
// ========================================
interface LogNoteModalProps {
  open: boolean;
  onClose: () => void;
  companyId?: string;
  companyName?: string;
  prefillContent?: string;
  prefillTag?: string;
  onSaved?: () => void;
}

export function LogNoteModal({ open, onClose, companyId, companyName, prefillContent = '', prefillTag, onSaved }: LogNoteModalProps) {
  const { addNote } = useWorkflow();
  const [selectedCompany, setSelectedCompany] = useState(companyId || '');
  const [content, setContent] = useState(prefillContent);
  const [tag, setTag] = useState<'Call Note' | 'Email' | 'Meeting' | 'General'>(
    (prefillTag as any) || 'General'
  );

  const activeCompanies = companies.filter(c => c.lifecycle === 'Active — Core' || c.lifecycle === 'Active — Non-core');
  const resolvedCompanyName = companyName || companies.find(c => c.id === selectedCompany)?.name || '';

  const handleSave = () => {
    if (!content.trim() || !resolvedCompanyName) return;
    addNote({
      companyId: selectedCompany || companies.find(c => c.name === resolvedCompanyName)?.id || '',
      companyName: resolvedCompanyName,
      content: content.trim(),
      tag,
    });
    setContent('');
    onSaved?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[16px]">
            <StickyNote className="w-4 h-4 text-blue-500" />
            Log Note
          </DialogTitle>
          <DialogDescription>Record a note about a portfolio company</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!companyName && (
            <div>
              <label className="text-[12px] text-muted-foreground block mb-1">Company</label>
              <select
                value={selectedCompany}
                onChange={e => setSelectedCompany(e.target.value)}
                className="w-full text-[13px] border border-border rounded-lg px-3 py-2 bg-card"
              >
                <option value="">Select company...</option>
                {activeCompanies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          {companyName && (
            <div className="flex items-center gap-2 text-[13px] bg-muted/30 rounded-lg px-3 py-2">
              <div className="w-5 h-5 rounded bg-primary text-primary-foreground flex items-center justify-center text-[10px]">
                {companyName[0]}
              </div>
              {companyName}
            </div>
          )}

          <div>
            <label className="text-[12px] text-muted-foreground block mb-1">Type</label>
            <div className="flex gap-2">
              {(['Call Note', 'Email', 'Meeting', 'General'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTag(t)}
                  className={`text-[12px] px-3 py-1.5 rounded-lg border transition-colors ${
                    tag === t
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border hover:bg-muted'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[12px] text-muted-foreground block mb-1">Note</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What happened? Key takeaways, decisions, follow-ups..."
              className="w-full text-[13px] border border-border rounded-lg px-3 py-2 bg-card min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <button onClick={onClose} className="text-[13px] px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim() || (!companyName && !selectedCompany)}
            className="text-[13px] px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Note
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ========================================
// NEW TODO MODAL
// ========================================
interface NewTodoModalProps {
  open: boolean;
  onClose: () => void;
  companyName?: string;
  prefillTitle?: string;
  prefillPriority?: 'high' | 'medium' | 'low';
  source?: 'manual' | 'flag';
}

export function NewTodoModal({ open, onClose, companyName, prefillTitle = '', prefillPriority = 'medium', source = 'manual' }: NewTodoModalProps) {
  const { addTodo } = useWorkflow();
  const [selectedCompany, setSelectedCompany] = useState(companyName || '');
  const [title, setTitle] = useState(prefillTitle);
  const [priority, setPriority] = useState(prefillPriority);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const activeCompanies = companies.filter(c => c.lifecycle === 'Active — Core' || c.lifecycle === 'Active — Non-core');

  const handleSave = () => {
    if (!title.trim() || !selectedCompany) return;
    addTodo({
      companyName: selectedCompany,
      title: title.trim(),
      dueDate,
      source,
      completed: false,
      priority,
    });
    setTitle('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[16px]">
            <ListTodo className="w-4 h-4 text-emerald-500" />
            New To-Do
          </DialogTitle>
          <DialogDescription>Create an action item for a portfolio company</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!companyName ? (
            <div>
              <label className="text-[12px] text-muted-foreground block mb-1">Company</label>
              <select
                value={selectedCompany}
                onChange={e => setSelectedCompany(e.target.value)}
                className="w-full text-[13px] border border-border rounded-lg px-3 py-2 bg-card"
              >
                <option value="">Select company...</option>
                {activeCompanies.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[13px] bg-muted/30 rounded-lg px-3 py-2">
              <div className="w-5 h-5 rounded bg-primary text-primary-foreground flex items-center justify-center text-[10px]">
                {companyName[0]}
              </div>
              {companyName}
            </div>
          )}

          <div>
            <label className="text-[12px] text-muted-foreground block mb-1">What needs to be done?</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Schedule founder call re: runway concerns"
              className="w-full text-[13px] border border-border rounded-lg px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] text-muted-foreground block mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full text-[13px] border border-border rounded-lg px-3 py-2 bg-card"
              />
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground block mb-1">Priority</label>
              <div className="flex gap-1.5">
                {(['high', 'medium', 'low'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 text-[12px] px-2 py-1.5 rounded-lg border transition-colors capitalize ${
                      priority === p
                        ? p === 'high' ? 'bg-red-50 text-red-700 border-red-300'
                        : p === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'bg-gray-50 text-gray-600 border-gray-300'
                        : 'bg-card border-border hover:bg-muted'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <button onClick={onClose} className="text-[13px] px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !selectedCompany}
            className="text-[13px] px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create To-Do
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ========================================
// SCHEDULE CHECK-IN MODAL
// ========================================
interface ScheduleCheckInModalProps {
  open: boolean;
  onClose: () => void;
  companyName?: string;
  prefillNotes?: string;
}

export function ScheduleCheckInModal({ open, onClose, companyName, prefillNotes = '' }: ScheduleCheckInModalProps) {
  const { addTodo, addActivity } = useWorkflow();
  const [selectedCompany, setSelectedCompany] = useState(companyName || '');
  const [type, setType] = useState<'Call' | 'Meeting' | 'Email'>('Call');
  const [date, setDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(prefillNotes);

  const activeCompanies = companies.filter(c => c.lifecycle === 'Active — Core' || c.lifecycle === 'Active — Non-core');

  const handleSave = () => {
    if (!selectedCompany) return;
    addTodo({
      companyName: selectedCompany,
      title: `${type} with ${selectedCompany} founder${notes ? ` — ${notes.slice(0, 50)}` : ''}`,
      dueDate: date,
      source: 'manual',
      completed: false,
      priority: 'high',
    });
    addActivity({
      companyName: selectedCompany,
      type: 'Check-in Scheduled',
      title: `${type} scheduled with ${selectedCompany} for ${new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
      description: notes || `Scheduled by ${currentUser.name}`,
      severity: 'info',
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[16px]">
            <Phone className="w-4 h-4 text-purple-500" />
            Schedule Check-in
          </DialogTitle>
          <DialogDescription>Schedule a founder check-in</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!companyName ? (
            <div>
              <label className="text-[12px] text-muted-foreground block mb-1">Company</label>
              <select
                value={selectedCompany}
                onChange={e => setSelectedCompany(e.target.value)}
                className="w-full text-[13px] border border-border rounded-lg px-3 py-2 bg-card"
              >
                <option value="">Select company...</option>
                {activeCompanies.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[13px] bg-muted/30 rounded-lg px-3 py-2">
              <div className="w-5 h-5 rounded bg-primary text-primary-foreground flex items-center justify-center text-[10px]">
                {companyName[0]}
              </div>
              {companyName}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] text-muted-foreground block mb-1">Type</label>
              <div className="flex gap-1.5">
                {(['Call', 'Meeting', 'Email'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 text-[12px] px-2 py-1.5 rounded-lg border transition-colors ${
                      type === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-muted'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-[13px] border border-border rounded-lg px-3 py-2 bg-card"
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] text-muted-foreground block mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Talking points, context, agenda..."
              className="w-full text-[13px] border border-border rounded-lg px-3 py-2 bg-card min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
            />
          </div>
        </div>

        <DialogFooter>
          <button onClick={onClose} className="text-[13px] px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedCompany}
            className="text-[13px] px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Schedule
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
