'use client';

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';

type Subtask = { id: string; title: string; done: boolean };
type Task = {
  id: string;
  listId: string;
  title: string;
  notes: string;
  dueDate: string;
  starred: boolean;
  completedAt: string | null;
  order: number;
  subtasks: Subtask[];
};
type TaskList = { id: string; title: string; order: number };
type SortMode = 'my-order' | 'date' | 'starred' | 'title';

const initialLists: TaskList[] = [
  { id: 'my-tasks', title: 'My tasks', order: 0 },
  { id: 'work', title: 'Work', order: 1 },
  { id: 'personal', title: 'Personal', order: 2 },
];
const initialTasks: Task[] = [
  { id: 'task-1', listId: 'my-tasks', title: 'Prepare project presentation', notes: 'Bring the updated product metrics.', dueDate: '2026-08-28', starred: true, completedAt: null, order: 0, subtasks: [{ id: 'sub-1', title: 'Review the opening slides', done: true }, { id: 'sub-2', title: 'Add customer feedback', done: false }] },
  { id: 'task-2', listId: 'my-tasks', title: 'Reply to the design team', notes: '', dueDate: '2026-08-29', starred: false, completedAt: null, order: 1, subtasks: [] },
  { id: 'task-3', listId: 'my-tasks', title: 'Review marketing proposal', notes: '', dueDate: '', starred: false, completedAt: '2026-08-27T09:30:00.000Z', order: 2, subtasks: [] },
  { id: 'task-4', listId: 'work', title: 'Plan next week’s agenda', notes: '', dueDate: '2026-08-30', starred: false, completedAt: null, order: 0, subtasks: [] },
  { id: 'task-5', listId: 'personal', title: 'Buy groceries', notes: 'Coffee, fruit, and pasta.', dueDate: '2026-08-29', starred: false, completedAt: null, order: 0, subtasks: [] },
];

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const dueLabel = (date: string) => {
  if (!date) return '';
  const target = new Date(`${date}T12:00:00`);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (target.getTime() === today.getTime()) return 'Today';
  if (target.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function Home() {
  const [lists, setLists] = useState<TaskList[]>(initialLists);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeListId, setActiveListId] = useState('my-tasks');
  const [sortMode, setSortMode] = useState<SortMode>('my-order');
  const [showCompleted, setShowCompleted] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [listMenuOpen, setListMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [createListOpen, setCreateListOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [loaded, setLoaded] = useState(false);
  const quickInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cached = localStorage.getItem('google-tasks-clone-v3');
    if (cached) {
      try {
        const state = JSON.parse(cached) as { lists: TaskList[]; tasks: Task[]; activeListId?: string };
        if (state.lists?.length && state.tasks) { setLists(state.lists); setTasks(state.tasks); setActiveListId(state.activeListId ?? state.lists[0].id); }
      } catch { /* keep starter state */ }
    }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem('google-tasks-clone-v3', JSON.stringify({ lists, tasks, activeListId })); }, [lists, tasks, activeListId, loaded]);
  useEffect(() => {
    const handler = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') { setSelectedId(null); setListMenuOpen(false); setSortMenuOpen(false); }
      if (event.key === 'n' && !event.metaKey && !event.ctrlKey && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') { event.preventDefault(); quickInput.current?.focus(); }
    };
    window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler);
  }, []);

  const activeList = lists.find(list => list.id === activeListId) ?? lists[0];
  const listTasks = useMemo(() => tasks.filter(task => task.listId === activeList.id), [tasks, activeList.id]);
  const sortedTasks = useMemo(() => [...listTasks].sort((a, b) => {
    if (sortMode === 'date') return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
    if (sortMode === 'starred') return Number(b.starred) - Number(a.starred) || a.order - b.order;
    if (sortMode === 'title') return a.title.localeCompare(b.title);
    return a.order - b.order;
  }), [listTasks, sortMode]);
  const openTasks = sortedTasks.filter(task => !task.completedAt);
  const completedTasks = sortedTasks.filter(task => task.completedAt);
  const selectedTask = tasks.find(task => task.id === selectedId) ?? null;

  function addTask(event: FormEvent) {
    event.preventDefault();
    const title = quickTitle.trim(); if (!title) return;
    const nextOrder = Math.max(-1, ...tasks.filter(task => task.listId === activeList.id).map(task => task.order)) + 1;
    setTasks(current => [...current, { id: uid(), listId: activeList.id, title, notes: '', dueDate: '', starred: false, completedAt: null, order: nextOrder, subtasks: [] }]);
    setQuickTitle(''); quickInput.current?.focus();
  }
  function toggleComplete(id: string) { setTasks(current => current.map(task => task.id === id ? { ...task, completedAt: task.completedAt ? null : new Date().toISOString() } : task)); }
  function toggleStar(id: string) { setTasks(current => current.map(task => task.id === id ? { ...task, starred: !task.starred } : task)); }
  function saveTask(next: Task) { setTasks(current => current.map(task => task.id === next.id ? next : task)); setSelectedId(null); }
  function createList(event: FormEvent) { event.preventDefault(); const title = newListTitle.trim(); if (!title) return; const newList = { id: uid(), title, order: lists.length }; setLists(current => [...current, newList]); setActiveListId(newList.id); setNewListTitle(''); setCreateListOpen(false); setListMenuOpen(false); }
  function removeTask(id: string) { setTasks(current => current.filter(task => task.id !== id)); setSelectedId(null); }

  return <main className="tasks-app">
    <header className="app-header">
      <div className="header-left"><button className="icon-button" aria-label="Main menu" onClick={() => setListMenuOpen(!listMenuOpen)}>☰</button><div className="tasks-logo" aria-hidden="true"><span>✓</span></div><span className="app-title">Tasks</span></div>
      <div className="header-right"><button className="icon-button help" aria-label="Help">?</button><button className="avatar" aria-label="Google account">S</button></div>
    </header>
    <section className="task-surface" aria-label="Google Tasks inspired task list">
      <div className="list-toolbar">
        <div className="picker-wrap"><button className="list-picker" onClick={() => setListMenuOpen(!listMenuOpen)} aria-expanded={listMenuOpen}>{activeList.title}<span>⌄</span></button>
          {listMenuOpen && <div className="popover list-popover">{[...lists].sort((a, b) => a.order - b.order).map(list => <button key={list.id} className={list.id === activeList.id ? 'active' : ''} onClick={() => { setActiveListId(list.id); setListMenuOpen(false); }}>{list.title}</button>)}<div className="popover-divider" /><button className="new-list-action" onClick={() => setCreateListOpen(true)}>＋ Create new list</button></div>}
        </div>
        <div className="toolbar-actions"><div className="picker-wrap"><button className="icon-button" aria-label="Sort tasks" onClick={() => setSortMenuOpen(!sortMenuOpen)}>⇅</button>{sortMenuOpen && <div className="popover sort-popover"><p>Sort by</p>{([['my-order', 'My order'], ['date', 'Date'], ['starred', 'Starred recently'], ['title', 'Title']] as [SortMode, string][]).map(([id, label]) => <button key={id} className={sortMode === id ? 'active' : ''} onClick={() => { setSortMode(id); setSortMenuOpen(false); }}>{sortMode === id && <span>✓</span>}{label}</button>)}</div>}</div><button className="icon-button" aria-label="List options">⋮</button></div>
      </div>
      <div className="task-region">
        {openTasks.map(task => <TaskRow key={task.id} task={task} onComplete={toggleComplete} onStar={toggleStar} onOpen={() => setSelectedId(task.id)} />)}
        {openTasks.length === 0 && <p className="empty-copy">No tasks yet. Add one below.</p>}
        <form className="quick-add" onSubmit={addTask}><span aria-hidden="true">＋</span><input ref={quickInput} value={quickTitle} onChange={event => setQuickTitle(event.target.value)} placeholder="Add a task" aria-label="Add a task" /><button type="submit">Add</button></form>
        {completedTasks.length > 0 && <section className="completed-group"><button className="completed-toggle" onClick={() => setShowCompleted(!showCompleted)} aria-expanded={showCompleted}><span>{showCompleted ? '⌄' : '›'}</span>Completed ({completedTasks.length})</button>{showCompleted && completedTasks.map(task => <TaskRow key={task.id} task={task} onComplete={toggleComplete} onStar={toggleStar} onOpen={() => setSelectedId(task.id)} />)}</section>}
      </div>
    </section>
    <p className="shortcut-hint">Press <kbd>n</kbd> to add a task</p>
    {selectedTask && <TaskDialog key={selectedTask.id} task={selectedTask} lists={lists} onClose={() => setSelectedId(null)} onSave={saveTask} onDelete={removeTask} />}
    {createListOpen && <div className="modal-backdrop" role="presentation"><form className="dialog small-dialog" onSubmit={createList}><h2>Create new list</h2><input autoFocus value={newListTitle} onChange={event => setNewListTitle(event.target.value)} placeholder="List name" aria-label="List name" /><div className="dialog-actions"><button type="button" className="text-button" onClick={() => setCreateListOpen(false)}>Cancel</button><button className="filled-button" type="submit">Create</button></div></form></div>}
  </main>;
}

function TaskRow({ task, onComplete, onStar, onOpen }: { task: Task; onComplete: (id: string) => void; onStar: (id: string) => void; onOpen: () => void }) {
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => { if (event.key === ' ') { event.preventDefault(); onComplete(task.id); } };
  return <article className={`task-row ${task.completedAt ? 'is-completed' : ''}`} tabIndex={0} onKeyDown={onKeyDown}>
    <button className="complete-button" onClick={() => onComplete(task.id)} aria-label={task.completedAt ? `Mark ${task.title} as incomplete` : `Mark ${task.title} as complete`}>{task.completedAt && '✓'}</button>
    <button className="task-main" onClick={onOpen}><span>{task.title}</span>{task.dueDate && <small className={task.dueDate < new Date().toISOString().slice(0, 10) && !task.completedAt ? 'overdue' : ''}>◷ {dueLabel(task.dueDate)}</small>}{task.subtasks.length > 0 && <small>☷ {task.subtasks.filter(subtask => subtask.done).length}/{task.subtasks.length}</small>}</button>
    <button className={`star-button ${task.starred ? 'starred' : ''}`} onClick={() => onStar(task.id)} aria-label={task.starred ? 'Remove star' : 'Add star'}>{task.starred ? '★' : '☆'}</button>
  </article>;
}

function TaskDialog({ task, lists, onClose, onSave, onDelete }: { task: Task; lists: TaskList[]; onClose: () => void; onSave: (task: Task) => void; onDelete: (id: string) => void }) {
  const [draft, setDraft] = useState<Task>({ ...task, subtasks: [...task.subtasks] });
  const [subtaskTitle, setSubtaskTitle] = useState('');
  function save(event?: { preventDefault: () => void }) { event?.preventDefault(); if (!draft.title.trim()) return; onSave({ ...draft, title: draft.title.trim() }); }
  function addSubtask() { const title = subtaskTitle.trim(); if (!title) return; setDraft(current => ({ ...current, subtasks: [...current.subtasks, { id: uid(), title, done: false }] })); setSubtaskTitle(''); }
  return <div className="modal-backdrop" role="presentation"><form className="dialog detail-dialog" onSubmit={save} onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') save(event); }}>
    <header><button type="button" className="icon-button" onClick={onClose} aria-label="Close">×</button><div><button type="button" className={`star-button ${draft.starred ? 'starred' : ''}`} onClick={() => setDraft(current => ({ ...current, starred: !current.starred }))}>{draft.starred ? '★' : '☆'}</button><button type="button" className="icon-button" onClick={() => onDelete(draft.id)} aria-label="Delete task">⌫</button></div></header>
    <label className="title-field"><span>Title</span><input autoFocus value={draft.title} onChange={event => setDraft(current => ({ ...current, title: event.target.value }))} /></label>
    <label className="notes-field"><span>Details</span><textarea value={draft.notes} onChange={event => setDraft(current => ({ ...current, notes: event.target.value }))} placeholder="Add details" rows={3} /></label>
    <div className="detail-grid"><label><span>Date</span><input type="date" value={draft.dueDate} onChange={event => setDraft(current => ({ ...current, dueDate: event.target.value }))} /></label><label><span>List</span><select value={draft.listId} onChange={event => setDraft(current => ({ ...current, listId: event.target.value }))}>{lists.map(list => <option key={list.id} value={list.id}>{list.title}</option>)}</select></label></div>
    <section className="subtasks"><h3>Subtasks</h3>{draft.subtasks.map(subtask => <label key={subtask.id} className="subtask"><input type="checkbox" checked={subtask.done} onChange={() => setDraft(current => ({ ...current, subtasks: current.subtasks.map(item => item.id === subtask.id ? { ...item, done: !item.done } : item) }))} /><span>{subtask.title}</span><button type="button" onClick={() => setDraft(current => ({ ...current, subtasks: current.subtasks.filter(item => item.id !== subtask.id) }))} aria-label="Remove subtask">×</button></label>)}<div className="subtask-add"><span>＋</span><input value={subtaskTitle} onChange={event => setSubtaskTitle(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addSubtask(); } }} placeholder="Add a subtask" /><button type="button" onClick={addSubtask}>Add</button></div></section>
    <footer><span>⌘/Ctrl + Enter to save</span><div><button type="button" className="text-button" onClick={onClose}>Cancel</button><button type="submit" className="filled-button">Save</button></div></footer>
  </form></div>;
}
