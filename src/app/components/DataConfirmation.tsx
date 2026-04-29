import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { Sparkles, Check, X, Mic, Mail, FileText, Database, Calendar, Bell, Pencil, AlertCircle } from 'lucide-react';
import { companies } from './mock-data';
import { validateFieldValue, type FieldKey } from './fieldValidation';

// ── Types ──────────────────────────────────────────────────────────────
export type ConnectorSource = 'granola' | 'gmail' | 'notion' | 'attio' | 'calendar' | 'specter';

export type DataConfirmation = {
  id: string;
  companyId: string;
  companyName: string;
  companyLogoColor: string;
  source: ConnectorSource;
  field: string;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
  context: string;       // The quote/excerpt that triggered detection
  detectedAt: Date;
};

// ── Source config ─────────────────────────────────────────────────────
const sourceConfig: Record<ConnectorSource, { label: string; icon: any; color: string; bg: string }> = {
  granola:  { label: 'Granola',  icon: Mic,      color: 'text-purple-600', bg: 'bg-purple-50' },
  gmail:    { label: 'Gmail',    icon: Mail,     color: 'text-red-600',    bg: 'bg-red-50' },
  notion:   { label: 'Notion',   icon: FileText, color: 'text-slate-700',  bg: 'bg-slate-100' },
  attio:    { label: 'Attio',    icon: Database, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  calendar: { label: 'Calendar', icon: Calendar, color: 'text-blue-600',   bg: 'bg-blue-50' },
  specter:  { label: 'Specter',  icon: Sparkles, color: 'text-amber-600',  bg: 'bg-amber-50' },
};

// ── Context ───────────────────────────────────────────────────────────
type Ctx = {
  pending: DataConfirmation[];
  addConfirmation: (c: Omit<DataConfirmation, 'id' | 'detectedAt'>) => void;
  confirm: (id: string) => void;
  reject: (id: string) => void;
  triggerDemo: () => void;
};

const DataConfirmationContext = createContext<Ctx>({
  pending: [],
  addConfirmation: () => {},
  confirm: () => {},
  reject: () => {},
  triggerDemo: () => {},
});

export const useDataConfirmation = () => useContext(DataConfirmationContext);

// ── Demo confirmations — used by triggerDemo for the demo flow ────────
const DEMO_TEMPLATES: Omit<DataConfirmation, 'id' | 'detectedAt' | 'companyId' | 'companyName' | 'companyLogoColor'>[] = [
  {
    source: 'granola',
    field: 'arr',
    fieldLabel: 'ARR',
    oldValue: '£480K',
    newValue: '£540K',
    context: '"...we just closed the Adeo deal at £60K ARR, taking us to £540K total ARR for the quarter."',
  },
  {
    source: 'gmail',
    field: 'cashBalance',
    fieldLabel: 'Cash Balance',
    oldValue: '£2.1M',
    newValue: '£1.85M',
    context: '"Updated cash position as of end of last week: £1.85M after the Q1 payroll and SaaS renewals."',
  },
  {
    source: 'attio',
    field: 'headcount',
    fieldLabel: 'Headcount',
    oldValue: '18',
    newValue: '21',
    context: '3 new hires added to Attio CRM this week: 2 engineers and 1 customer success manager.',
  },
  {
    source: 'notion',
    field: 'runway',
    fieldLabel: 'Runway',
    oldValue: '14mo',
    newValue: '11mo',
    context: '"Updated burn projection in Q2 forecast doc — runway revised to 11 months given new hires."',
  },
  {
    source: 'calendar',
    field: 'ebitda',
    fieldLabel: 'EBITDA',
    oldValue: '-£25K',
    newValue: '-£18K',
    context: 'From board meeting agenda: Q1 EBITDA improved to -£18K (vs -£25K plan).',
  },
  {
    source: 'specter',
    field: 'arr',
    fieldLabel: 'ARR',
    oldValue: '£1.4M',
    newValue: '£1.62M',
    context: 'Specter web traffic + hiring signals suggest ARR ~£1.6M based on industry benchmarks.',
  },
];

// ── Provider ──────────────────────────────────────────────────────────
export function DataConfirmationProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<DataConfirmation[]>([]);

  const addConfirmation = useCallback((c: Omit<DataConfirmation, 'id' | 'detectedAt'>) => {
    const id = `conf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setPending(prev => [...prev, { ...c, id, detectedAt: new Date() }]);
  }, []);

  const confirm = useCallback((id: string) => {
    setPending(prev => prev.filter(c => c.id !== id));
  }, []);

  const reject = useCallback((id: string) => {
    setPending(prev => prev.filter(c => c.id !== id));
  }, []);

  const triggerDemo = useCallback(() => {
    const template = DEMO_TEMPLATES[Math.floor(Math.random() * DEMO_TEMPLATES.length)];
    const company = companies.filter(c => c.lifecycle === 'Active — Core')[Math.floor(Math.random() * 6)];
    if (!company) return;
    addConfirmation({
      ...template,
      companyId: company.id,
      companyName: company.name,
      companyLogoColor: company.logoColor,
    });
  }, [addConfirmation]);

  return (
    <DataConfirmationContext.Provider value={{ pending, addConfirmation, confirm, reject, triggerDemo }}>
      {children}
      <DataConfirmationUI />
    </DataConfirmationContext.Provider>
  );
}

// ── UI ────────────────────────────────────────────────────────────────
function DataConfirmationUI() {
  const { pending, confirm, reject, triggerDemo } = useDataConfirmation();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [editedValue, setEditedValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // When a new confirmation arrives, animate it in
  useEffect(() => {
    if (pending.length > 0) {
      const latest = pending[pending.length - 1];
      setAnimatingId(latest.id);
      const t = setTimeout(() => setAnimatingId(null), 600);
      return () => clearTimeout(t);
    }
  }, [pending.length]);

  const active = activeId ? pending.find(c => c.id === activeId) : null;

  // Reset edit state when modal opens or active changes
  useEffect(() => {
    if (active) {
      setEditedValue(active.newValue);
      setIsEditingValue(false);
      setValidationError(null);
    }
  }, [activeId]);

  // Live-validate the edited value
  useEffect(() => {
    if (!active) return;
    const result = validateFieldValue(active.field as FieldKey, editedValue);
    setValidationError(result.valid ? null : result.error || 'Invalid value');
  }, [editedValue, active]);

  const closeModal = () => {
    setActiveId(null);
    setIsEditingValue(false);
    setValidationError(null);
  };

  return (
    <>
      {/* Demo trigger — fixed bottom-left floating button */}
      <button
        onClick={triggerDemo}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2.5 text-[12px] font-medium text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105 transition-all"
        title="Simulate connector detecting a data change"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Simulate detection
      </button>

      {/* Toast stack — bottom right */}
      {pending.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2 max-w-[360px]">
          {pending.slice(-3).reverse().map((conf, idx) => {
            const cfg = sourceConfig[conf.source];
            const Icon = cfg.icon;
            const isAnimating = animatingId === conf.id;
            return (
              <button
                key={conf.id}
                onClick={() => setActiveId(conf.id)}
                style={{ transform: `translateY(${idx * -2}px) scale(${1 - idx * 0.03})`, zIndex: 100 - idx }}
                className={`text-left bg-white border border-slate-200 rounded-xl shadow-lg hover:shadow-xl transition-all p-3 flex items-start gap-3 hover:border-indigo-300 ${
                  isAnimating ? 'animate-[slideInRight_0.4s_ease-out]' : ''
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[10px] text-slate-400">just now</span>
                  </div>
                  <p className="text-[12px] text-slate-700 font-medium truncate">
                    Update detected for <span className="text-slate-900">{conf.companyName}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {conf.fieldLabel}: {conf.oldValue} → <span className="font-semibold text-slate-700">{conf.newValue}</span>
                  </p>
                </div>
                <Bell className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-1 animate-pulse" />
              </button>
            );
          })}
          {pending.length > 3 && (
            <div className="text-[11px] text-slate-500 text-center pt-1">
              +{pending.length - 3} more pending
            </div>
          )}
        </div>
      )}

      {/* Modal — opened when clicking a toast */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-[520px] w-full mx-4 overflow-hidden animate-[scaleIn_0.2s_ease-out]"
            onClick={e => e.stopPropagation()}
          >
            {(() => {
              const cfg = sourceConfig[active.source];
              const Icon = cfg.icon;
              const isEdited = editedValue !== active.newValue;
              return (
                <>
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg}`}>
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[15px] font-semibold text-slate-900">Confirm data update</h3>
                      <p className="text-[12px] text-slate-500">Detected from <span className={`font-medium ${cfg.color}`}>{cfg.label}</span> · {timeAgo(active.detectedAt)}</p>
                    </div>
                    <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="px-6 py-5 space-y-4">
                    {/* Company */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[13px] font-semibold" style={{ background: active.companyLogoColor }}>
                        {active.companyName[0]}
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-slate-900">{active.companyName}</p>
                        <p className="text-[11px] text-slate-500">Field: {active.fieldLabel}</p>
                      </div>
                    </div>

                    {/* Old → New (editable) — labels share fixed-height row so values baseline-align */}
                    <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <div className="h-5 flex items-center mb-1.5">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 leading-none">Current value</p>
                        </div>
                        <div className="h-8 flex items-center">
                          <p className="text-[18px] font-mono-num font-semibold text-slate-500 line-through decoration-slate-300 leading-none">{active.oldValue}</p>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="h-5 flex items-center justify-between mb-1.5">
                          <p className={`text-[10px] font-medium uppercase tracking-wider leading-none ${isEdited ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {isEdited ? 'Edited value' : 'New value'}
                          </p>
                          {!isEditingValue && (
                            <button
                              onClick={() => setIsEditingValue(true)}
                              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-indigo-600 transition-colors leading-none"
                              title="Edit the suggested value"
                            >
                              <Pencil className="w-3 h-3" /> Edit
                            </button>
                          )}
                          {isEditingValue && (
                            <button
                              onClick={() => setIsEditingValue(false)}
                              className="text-[10px] text-indigo-600 hover:text-indigo-700 font-medium leading-none"
                            >
                              Done
                            </button>
                          )}
                        </div>
                        <div className="h-8 flex items-center">
                          {isEditingValue ? (
                            <input
                              autoFocus
                              value={editedValue}
                              onChange={e => setEditedValue(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter' && !validationError) setIsEditingValue(false); }}
                              onBlur={() => { if (!validationError) setIsEditingValue(false); }}
                              className={`w-full text-[18px] font-mono-num font-semibold rounded-md px-2 py-0 h-7 border focus:outline-none focus:ring-2 ${
                                validationError ? 'text-red-600 border-red-300 focus:ring-red-200 bg-white' :
                                isEdited ? 'text-amber-600 border-amber-300 focus:ring-amber-200 bg-white' :
                                'text-emerald-600 border-emerald-300 focus:ring-emerald-200 bg-white'
                              }`}
                            />
                          ) : (
                            <p className={`text-[18px] font-mono-num font-semibold leading-none ${validationError ? 'text-red-600' : isEdited ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {editedValue}
                              {isEdited && !validationError && <span className="text-[11px] ml-1.5 font-normal text-amber-500">· edited</span>}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Validation error */}
                    {validationError && (
                      <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[12px] text-red-700">{validationError}</p>
                      </div>
                    )}

                    {/* Context / source quote */}
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1.5">Source context</p>
                      <div className="bg-white border-l-2 border-indigo-300 pl-3 py-1">
                        <p className="text-[12px] text-slate-700 leading-relaxed italic">{active.context}</p>
                      </div>
                    </div>

                    {/* Helper text */}
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      As the company owner, please confirm this update before it is written to the database.
                      You can edit the value if the detection isn't quite right.
                      Confirming pushes to the staging table; rejecting discards the suggestion.
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => { reject(active.id); closeModal(); }}
                      className="px-4 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => { if (!validationError) { confirm(active.id); closeModal(); } }}
                      disabled={!!validationError}
                      className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white rounded-lg transition-colors ${
                        validationError ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" /> {isEdited ? 'Confirm with edit' : 'Confirm update'}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes slideInRight {
          0% { transform: translateX(120%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes scaleIn {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────
function timeAgo(d: Date): string {
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 5) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  return `${Math.floor(min / 60)}h ago`;
}
