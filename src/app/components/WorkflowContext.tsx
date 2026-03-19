import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  flags as mockFlags,
  todos as mockTodos,
  activityFeed as mockActivity,
  currentUser,
  type Flag,
  type Todo,
  type ActivityEvent,
} from './mock-data';

export interface Note {
  id: string;
  companyId: string;
  companyName: string;
  author: string;
  date: string;
  content: string;
  tag: 'Call Note' | 'Email' | 'Meeting' | 'General' | 'Check-in';
}

interface WorkflowState {
  todos: Todo[];
  flags: Flag[];
  notes: Note[];
  activityFeed: ActivityEvent[];
  reviewProgress: {
    reviewed: string[];
    skipped: string[];
    commentaries: Record<string, string>;
  };
}

interface WorkflowContextType extends WorkflowState {
  // Todos
  addTodo: (todo: Omit<Todo, 'id'>) => void;
  toggleTodo: (id: string) => void;
  // Notes
  addNote: (note: Omit<Note, 'id' | 'date' | 'author'>) => void;
  getNotesForCompany: (companyId: string) => Note[];
  // Flags
  dismissFlag: (id: string) => void;
  convertFlagToTodo: (flagId: string) => void;
  markFlagActioned: (id: string) => void;
  snoozeFlag: (id: string) => void;
  // Activity
  addActivity: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
  // Review
  markReviewed: (companyId: string) => void;
  markSkipped: (companyId: string) => void;
  setCommentary: (companyId: string, text: string) => void;
  // Reset
  resetAll: () => void;
}

const STORAGE_KEY = 'crane_workflow_state_v1';

function loadState(): WorkflowState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

function saveState(state: WorkflowState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function getDefaultState(): WorkflowState {
  return {
    todos: [...mockTodos],
    flags: [...mockFlags],
    notes: [],
    activityFeed: [...mockActivity],
    reviewProgress: { reviewed: [], skipped: [], commentaries: {} },
  };
}

const WorkflowContext = createContext<WorkflowContextType | null>(null);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkflowState>(() => loadState() || getDefaultState());

  // Persist on every change
  useEffect(() => { saveState(state); }, [state]);

  const addTodo = (todo: Omit<Todo, 'id'>) => {
    const newTodo: Todo = { ...todo, id: `todo-${Date.now()}` };
    setState(s => ({
      ...s,
      todos: [newTodo, ...s.todos],
      activityFeed: [{
        id: `act-${Date.now()}`,
        companyName: todo.companyName,
        type: 'Action Created',
        title: `New to-do: ${todo.title}`,
        description: `Created by ${currentUser.name}`,
        timestamp: new Date().toISOString(),
        severity: 'info',
      }, ...s.activityFeed],
    }));
  };

  const toggleTodo = (id: string) => {
    setState(s => {
      const todo = s.todos.find(t => t.id === id);
      const newTodos = s.todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      const newActivity = todo && !todo.completed ? [{
        id: `act-${Date.now()}`,
        companyName: todo.companyName,
        type: 'Action Completed',
        title: `Completed: ${todo.title}`,
        description: `Marked complete by ${currentUser.name}`,
        timestamp: new Date().toISOString(),
        severity: 'info' as const,
      }, ...s.activityFeed] : s.activityFeed;
      return { ...s, todos: newTodos, activityFeed: newActivity };
    });
  };

  const addNote = (note: Omit<Note, 'id' | 'date' | 'author'>) => {
    const newNote: Note = {
      ...note,
      id: `note-${Date.now()}`,
      date: new Date().toISOString(),
      author: currentUser.name,
    };
    setState(s => ({
      ...s,
      notes: [newNote, ...s.notes],
      activityFeed: [{
        id: `act-${Date.now()}`,
        companyName: note.companyName,
        type: 'Note Logged',
        title: `${note.tag}: ${note.content.slice(0, 60)}${note.content.length > 60 ? '...' : ''}`,
        description: `Logged by ${currentUser.name}`,
        timestamp: new Date().toISOString(),
        severity: 'info',
      }, ...s.activityFeed],
    }));
  };

  const getNotesForCompany = (companyId: string) => {
    return state.notes.filter(n => n.companyId === companyId);
  };

  const dismissFlag = (id: string) => {
    setState(s => ({
      ...s,
      flags: s.flags.filter(f => f.id !== id),
    }));
  };

  const convertFlagToTodo = (flagId: string) => {
    const flag = state.flags.find(f => f.id === flagId);
    if (!flag) return;
    const newTodo: Todo = {
      id: `todo-${Date.now()}`,
      companyName: flag.companyName,
      title: flag.suggestedAction || flag.headline,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      source: 'flag',
      completed: false,
      priority: flag.urgency === 'high' ? 'high' : flag.urgency === 'medium' ? 'medium' : 'low',
    };
    setState(s => ({
      ...s,
      todos: [newTodo, ...s.todos],
      flags: s.flags.filter(f => f.id !== flagId),
      activityFeed: [{
        id: `act-${Date.now()}`,
        companyName: flag.companyName,
        type: 'Flag Converted',
        title: `Alert converted to action: ${flag.headline}`,
        description: `${flag.suggestedAction}`,
        timestamp: new Date().toISOString(),
        severity: 'info',
      }, ...s.activityFeed],
    }));
  };

  const markFlagActioned = (id: string) => {
    const flag = state.flags.find(f => f.id === id);
    if (!flag) return;
    setState(s => ({
      ...s,
      flags: s.flags.filter(f => f.id !== id),
      activityFeed: [{
        id: `act-${Date.now()}`,
        companyName: flag.companyName,
        type: 'Flag Resolved',
        title: `Alert resolved: ${flag.headline}`,
        description: `Resolved by ${currentUser.name}`,
        timestamp: new Date().toISOString(),
        severity: 'info',
      }, ...s.activityFeed],
    }));
  };

  const snoozeFlag = (id: string) => {
    // In a real app this would set a snoozeUntil date; for demo just remove
    setState(s => ({ ...s, flags: s.flags.filter(f => f.id !== id) }));
  };

  const addActivity = (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    setState(s => ({
      ...s,
      activityFeed: [{
        ...event,
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
      }, ...s.activityFeed],
    }));
  };

  const markReviewed = (companyId: string) => {
    setState(s => ({
      ...s,
      reviewProgress: {
        ...s.reviewProgress,
        reviewed: [...new Set([...s.reviewProgress.reviewed, companyId])],
      },
    }));
  };

  const markSkipped = (companyId: string) => {
    setState(s => ({
      ...s,
      reviewProgress: {
        ...s.reviewProgress,
        skipped: [...new Set([...s.reviewProgress.skipped, companyId])],
      },
    }));
  };

  const setCommentary = (companyId: string, text: string) => {
    setState(s => ({
      ...s,
      reviewProgress: {
        ...s.reviewProgress,
        commentaries: { ...s.reviewProgress.commentaries, [companyId]: text },
      },
    }));
  };

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(getDefaultState());
  };

  return (
    <WorkflowContext.Provider value={{
      ...state,
      addTodo, toggleTodo,
      addNote, getNotesForCompany,
      dismissFlag, convertFlagToTodo, markFlagActioned, snoozeFlag,
      addActivity,
      markReviewed, markSkipped, setCommentary,
      resetAll,
    }}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error('useWorkflow must be used within WorkflowProvider');
  return ctx;
}
