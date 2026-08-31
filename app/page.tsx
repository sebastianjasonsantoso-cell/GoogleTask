'use client';

import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react';

type Subtask = { id: string; title: string; done: boolean };
type Task = { id: string; listId: string; title: string; notes: string; dueDate: string; dueTime?: string; allDay?: boolean; repeat?: string; starred: boolean; completedAt: string | null; order: number; subtasks: Subtask[] };
type TaskList = { id: string; title: string; order: number };
type SortMode = 'my-order' | 'date' | 'deadline' | 'starred' | 'title';
type ListEditorMode = 'create' | 'rename' | null;

const seedLists: TaskList[] = [{ id: 'my-tasks', title: 'My Tasks', order: 0 }, { id: 'work', title: 'Work', order: 1 }, { id: 'personal', title: 'Personal', order: 2 }];
const seedTasks: Task[] = [
  { id: 'task-1', listId: 'my-tasks', title: 'Prepare project presentation', notes: 'Bring the updated product metrics.', dueDate: '2026-09-02', starred: true, completedAt: null, order: 0, subtasks: [{ id: 'sub-1', title: 'Review the opening slides', done: true }, { id: 'sub-2', title: 'Add customer feedback', done: false }] },
  { id: 'task-2', listId: 'my-tasks', title: 'Reply to the design team', notes: '', dueDate: '2026-09-03', starred: false, completedAt: null, order: 1, subtasks: [] },
  { id: 'task-3', listId: 'my-tasks', title: 'Review marketing proposal', notes: '', dueDate: '', starred: false, completedAt: '2026-08-27T09:30:00.000Z', order: 2, subtasks: [] },
  { id: 'task-4', listId: 'work', title: 'Plan next week’s agenda', notes: '', dueDate: '2026-09-04', starred: false, completedAt: null, order: 0, subtasks: [] },
  { id: 'task-5', listId: 'personal', title: 'Buy groceries', notes: 'Coffee, fruit, and pasta.', dueDate: '2026-09-01', starred: false, completedAt: null, order: 0, subtasks: [] },
];

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const newTask = (listId: string, order: number): Task => ({ id: uid(), listId, title: '', notes: '', dueDate: '', dueTime: '', allDay: false, repeat: 'Does not repeat', starred: false, completedAt: null, order, subtasks: [] });
const dueLabel = (date: string) => date ? new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

function Icon({ name, size = 20 }: { name: 'menu' | 'tasks' | 'plus' | 'all' | 'star' | 'chevron' | 'more' | 'help' | 'apps' | 'close' | 'calendar' | 'delete' | 'repeat' | 'check'; size?: number }) {
  const shapes: Record<string, React.ReactNode> = {
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>, tasks: <><path d="M7.3 3.5h9.2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H7.3a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" /><path d="m8.5 12 2.1 2.1 4.8-5" /></>, plus: <><path d="M12 5v14M5 12h14" /></>, all: <><path d="M6 12.2 10 16l8-8" /><circle cx="12" cy="12" r="8.5" /></>, star: <path d="m12 3 2.75 5.57 6.15.9-4.45 4.34 1.05 6.13L12 17.05l-5.5 2.89 1.05-6.13L3.1 9.47l6.15-.9L12 3Z" />, chevron: <path d="m7 9 5 5 5-5" />, more: <><circle cx="12" cy="5" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="19" r="1" fill="currentColor" /></>, help: <><circle cx="12" cy="12" r="8.5" /><path d="M9.7 9.4a2.45 2.45 0 1 1 4.08 1.82c-.95.8-1.78 1.3-1.78 2.78" /><path d="M12 16.8h.01" /></>, apps: <><circle cx="6" cy="6" r="1.3" fill="currentColor" /><circle cx="12" cy="6" r="1.3" fill="currentColor" /><circle cx="18" cy="6" r="1.3" fill="currentColor" /><circle cx="6" cy="12" r="1.3" fill="currentColor" /><circle cx="12" cy="12" r="1.3" fill="currentColor" /><circle cx="18" cy="12" r="1.3" fill="currentColor" /><circle cx="6" cy="18" r="1.3" fill="currentColor" /><circle cx="12" cy="18" r="1.3" fill="currentColor" /><circle cx="18" cy="18" r="1.3" fill="currentColor" /></>, close: <><path d="m7 7 10 10M17 7 7 17" /></>, calendar: <><rect x="4.5" y="6" width="15" height="13" rx="1.8" /><path d="M8 4v4M16 4v4M4.5 10h15" /></>, delete: <><path d="M5 7h14M10 10v6M14 10v6M9 7l.7-2h4.6l.7 2M7 7l.7 12h8.6L17 7" /></>, repeat: <><path d="M17 4.5 20 7.5l-3 3M4 12.5V11a3.5 3.5 0 0 1 3.5-3.5H20M7 19.5l-3-3 3-3M20 11.5V13a3.5 3.5 0 0 1-3.5 3.5H4" /></>, check: <path d="m5.5 12 4 4 9-9" />,
  };
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]}</svg>;
}

export default function Home() {
  const [lists, setLists] = useState<TaskList[]>(seedLists);
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [activeView, setActiveView] = useState('my-tasks');
  const [sortMode, setSortMode] = useState<SortMode>('my-order');
  const [showCompleted, setShowCompleted] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [inlineDraft, setInlineDraft] = useState<Task | null>(null);
  const [listOptionsOpen, setListOptionsOpen] = useState(false);
  const [listEditorMode, setListEditorMode] = useState<ListEditorMode>(null);
  const [listTitle, setListTitle] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem('google-tasks-clone-v4') ?? localStorage.getItem('google-tasks-clone-v3');
    if (cached) try { const state = JSON.parse(cached) as { lists: TaskList[]; tasks: Task[]; activeView?: string; activeListId?: string }; if (state.lists?.length && state.tasks) { setLists(state.lists); setTasks(state.tasks); setActiveView(state.activeView ?? state.activeListId ?? state.lists[0].id); } } catch { /* use seed data */ }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem('google-tasks-clone-v4', JSON.stringify({ lists, tasks, activeView })); }, [lists, tasks, activeView, loaded]);

  const activeList = lists.find(list => list.id === activeView) ?? lists[0];
  const aggregateView = activeView === 'all' || activeView === 'starred';
  const title = activeView === 'all' ? 'All tasks' : activeView === 'starred' ? 'Starred' : activeList.title;
  const viewTasks = useMemo(() => tasks.filter(task => activeView === 'all' || (activeView === 'starred' ? task.starred : task.listId === activeList.id)), [tasks, activeView, activeList.id]);
  const sortedTasks = useMemo(() => [...viewTasks].sort((a, b) => { if (sortMode === 'date' || sortMode === 'deadline') return (a.dueDate || '9999').localeCompare(b.dueDate || '9999'); if (sortMode === 'starred') return Number(b.starred) - Number(a.starred) || a.order - b.order; if (sortMode === 'title') return a.title.localeCompare(b.title); return a.order - b.order; }), [viewTasks, sortMode]);
  const openTasks = sortedTasks.filter(task => !task.completedAt);
  const completedTasks = sortedTasks.filter(task => task.completedAt);
  const defaultListId = aggregateView ? lists[0].id : activeList.id;
  const createDraft = () => newTask(defaultListId, Math.max(-1, ...tasks.filter(task => task.listId === defaultListId).map(task => task.order)) + 1);

  function saveTask(next: Task) { setTasks(current => current.some(task => task.id === next.id) ? current.map(task => task.id === next.id ? next : task) : [...current, next]); setEditingTask(null); setInlineDraft(null); }
  function toggleComplete(id: string) { setTasks(current => current.map(task => task.id === id ? { ...task, completedAt: task.completedAt ? null : new Date().toISOString() } : task)); }
  function toggleStar(id: string) { setTasks(current => current.map(task => task.id === id ? { ...task, starred: !task.starred } : task)); }
  function removeTask(id: string) { setTasks(current => current.filter(task => task.id !== id)); setEditingTask(null); }
  function saveList(event: FormEvent) { event.preventDefault(); const name = listTitle.trim(); if (!name) return; if (listEditorMode === 'rename') setLists(current => current.map(list => list.id === activeList.id ? { ...list, title: name } : list)); else { const item = { id: uid(), title: name, order: lists.length }; setLists(current => [...current, item]); setActiveView(item.id); } setListTitle(''); setListEditorMode(null); }
  function deleteCompleted() { setTasks(current => current.filter(task => !task.completedAt || task.listId !== activeList.id)); setListOptionsOpen(false); }

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => { if (event.key === 'Escape') { setEditingTask(null); setInlineDraft(null); setListOptionsOpen(false); setListEditorMode(null); } if (event.key === 'n' && !event.metaKey && !event.ctrlKey && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName ?? '')) { event.preventDefault(); setInlineDraft(createDraft()); } };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [activeView, tasks, lists]);

  return <main className="tasks-app">
    <header className="topbar"><div className="brand"><button className="icon-button" aria-label="Main menu"><Icon name="menu" /></button><span className="brand-icon"><Icon name="check" size={22} /></span><span>Tasks</span></div><div className="topbar-actions"><button className="icon-button" aria-label="Support menu"><Icon name="help" /></button><button className="icon-button" aria-label="Google apps"><Icon name="apps" /></button><button className="account" aria-label="Google account">S</button></div></header>
    <div className="workspace">
      <aside className="sidebar" aria-label="Task navigation">
        <button className="create-button" onClick={() => setEditingTask(createDraft())}><Icon name="plus" />Create</button>
        <nav className="sidebar-nav" aria-label="Task views"><button className={(activeView === 'all' || activeView === 'my-tasks') ? 'nav-item selected' : 'nav-item'} onClick={() => setActiveView('all')}><Icon name="all" />All tasks</button><button className={activeView === 'starred' ? 'nav-item selected' : 'nav-item'} onClick={() => setActiveView('starred')}><Icon name="star" />Starred</button></nav>
        <div className="lists-heading"><span>Lists</span><button className="small-icon" aria-label="Toggle collapsing lists"><Icon name="chevron" /></button></div>
        <div className="lists" role="listbox" aria-label="Select task lists to show">{[...lists].sort((a, b) => a.order - b.order).map(list => <button key={list.id} role="option" aria-selected={activeView === list.id} className={activeView === list.id ? 'list-item selected' : 'list-item'} onClick={() => setActiveView(list.id)}><span className="list-check">{activeView === list.id && <Icon name="check" size={15} />}</span><span>{list.title}</span></button>)}</div>
        <button className="new-list-link" onClick={() => { setListTitle(''); setListEditorMode('create'); }}><Icon name="plus" />Create new list</button>
      </aside>
      <section className="task-canvas" aria-label={`${title} task list`}>
        <div className="canvas-heading"><div className="title-row"><h1>{title}</h1><div className="options-wrap"><button className="icon-button" aria-label="List options" onClick={() => setListOptionsOpen(!listOptionsOpen)}><Icon name="more" /></button>{listOptionsOpen && <div className="menu options-menu"><p>Sort by</p>{([['my-order', 'My order'], ['date', 'Date'], ['deadline', 'Deadline'], ['starred', 'Starred recently'], ['title', 'Title']] as [SortMode, string][]).map(([id, label]) => <button key={id} onClick={() => { setSortMode(id); setListOptionsOpen(false); }}><span>{sortMode === id && <Icon name="check" size={16} />}</span>{label}</button>)}{!aggregateView && <><hr /><button onClick={() => { setListOptionsOpen(false); setListTitle(activeList.title); setListEditorMode('rename'); }}>Rename list</button><button onClick={deleteCompleted}>Delete all completed tasks</button></>}</div>}</div></div><button className="add-task-link" onClick={() => setInlineDraft(createDraft())}><span><Icon name="all" size={21} /><Icon name="plus" size={11} /></span>Add a task</button></div>
        <div className="task-list" aria-label="Active tasks">{inlineDraft && <InlineComposer task={inlineDraft} onChange={setInlineDraft} onSave={saveTask} onCancel={() => setInlineDraft(null)} />}{openTasks.map(task => <TaskRow key={task.id} task={task} onComplete={toggleComplete} onStar={toggleStar} onOpen={() => setEditingTask(task)} />)}{!inlineDraft && openTasks.length === 0 && <div className="empty-state"><div className="empty-glyph"><Icon name="tasks" size={34} /></div><p>No tasks yet</p><span>Add your to-dos and keep track of<br />them across Google Workspace</span></div>}{completedTasks.length > 0 && <section className="completed"><button className="completed-toggle" onClick={() => setShowCompleted(!showCompleted)} aria-expanded={showCompleted}><Icon name="chevron" />Completed ({completedTasks.length})</button>{showCompleted && completedTasks.map(task => <TaskRow key={task.id} task={task} onComplete={toggleComplete} onStar={toggleStar} onOpen={() => setEditingTask(task)} />)}</section>}</div>
      </section>
    </div>
    {editingTask && <TaskDialog key={editingTask.id} task={editingTask} lists={lists} onClose={() => setEditingTask(null)} onSave={saveTask} onDelete={removeTask} />}
    {listEditorMode && <div className="modal-backdrop" role="presentation"><form className="dialog list-dialog" onSubmit={saveList}><header><h2>{listEditorMode === 'create' ? 'Create new list' : 'Rename list'}</h2><button type="button" className="icon-button" onClick={() => setListEditorMode(null)} aria-label="Close"><Icon name="close" /></button></header><label><span>List name</span><input autoFocus value={listTitle} onChange={event => setListTitle(event.target.value)} /></label><footer><button type="button" className="text-button" onClick={() => setListEditorMode(null)}>Cancel</button><button className="primary-button" type="submit">Done</button></footer></form></div>}
  </main>;
}

function TaskRow({ task, onComplete, onStar, onOpen }: { task: Task; onComplete: (id: string) => void; onStar: (id: string) => void; onOpen: () => void }) {
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => { if (event.key === ' ') { event.preventDefault(); onComplete(task.id); } if (event.key === 'Enter') onOpen(); };
  return <article className={`task-row ${task.completedAt ? 'is-completed' : ''}`} tabIndex={0} onKeyDown={onKeyDown}><button className="complete-button" onClick={() => onComplete(task.id)} aria-label={task.completedAt ? `Mark ${task.title} as incomplete` : `Mark ${task.title} as complete`}>{task.completedAt && <Icon name="check" size={14} />}</button><button className="task-main" onClick={onOpen}><span className="task-title">{task.title}</span><span className="task-meta">{task.dueDate && <small><Icon name="calendar" size={14} />{dueLabel(task.dueDate)}</small>}{task.subtasks.length > 0 && <small>{task.subtasks.filter(subtask => subtask.done).length}/{task.subtasks.length} subtasks</small>}</span></button><button className={`row-star ${task.starred ? 'starred' : ''}`} onClick={() => onStar(task.id)} aria-label={task.starred ? 'Remove from starred' : 'Add to starred'}><Icon name="star" /></button></article>;
}

function InlineComposer({ task, onChange, onSave, onCancel }: { task: Task; onChange: (task: Task) => void; onSave: (task: Task) => void; onCancel: () => void }) {
  function submit(event: FormEvent) { event.preventDefault(); if (task.title.trim()) onSave({ ...task, title: task.title.trim() }); }
  return <form className="inline-composer" onSubmit={submit}><button type="button" className="complete-button" aria-label="Mark completed"><span /></button><div className="inline-body"><input autoFocus value={task.title} onChange={event => onChange({ ...task, title: event.target.value })} placeholder="Title" aria-label="Task title" onKeyDown={event => { if (event.key === 'Escape') onCancel(); }} /><button type="button" className="details-link" onClick={() => onChange({ ...task, notes: task.notes || ' ' })}>Details</button><div className="inline-tools"><button type="button" onClick={() => onChange({ ...task, dueDate: new Date().toISOString().slice(0, 10) })}>Today</button><button type="button" onClick={() => { const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); onChange({ ...task, dueDate: tomorrow.toISOString().slice(0, 10) }); }}>Tomorrow</button><label><Icon name="calendar" size={17} /><input type="date" value={task.dueDate} onChange={event => onChange({ ...task, dueDate: event.target.value })} /></label><button type="button"><Icon name="repeat" size={17} /></button></div></div><div className="inline-actions"><button type="button" className="row-star" aria-label="Add to starred" onClick={() => onChange({ ...task, starred: !task.starred })}><Icon name="star" /></button><button type="button" className="text-button" onClick={onCancel}>Cancel</button><button type="submit" className="primary-button" disabled={!task.title.trim()}>Save</button></div></form>;
}

function TaskDialog({ task, lists, onClose, onSave, onDelete }: { task: Task; lists: TaskList[]; onClose: () => void; onSave: (task: Task) => void; onDelete: (id: string) => void }) {
  const [draft, setDraft] = useState<Task>({ ...task, subtasks: [...task.subtasks] }); const isNew = !task.title;
  function save(event: FormEvent) { event.preventDefault(); if (draft.title.trim()) onSave({ ...draft, title: draft.title.trim() }); }
  return <div className="modal-backdrop" role="presentation"><form className="dialog task-dialog" aria-label={isNew ? 'Add a task' : 'Edit task'} onSubmit={save}><header><h2>{isNew ? 'Add a task' : 'Task details'}</h2><div>{!isNew && <button type="button" className="icon-button" onClick={() => onDelete(draft.id)} aria-label="Delete task"><Icon name="delete" /></button>}<button type="button" className="icon-button" onClick={onClose} aria-label="Close"><Icon name="close" /></button></div></header><div className="dialog-body"><input className="task-title-input" autoFocus value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} placeholder="Add title" aria-label="Add title" /><div className="field-row"><label><span>Date</span><input type="date" value={draft.dueDate} onChange={event => setDraft({ ...draft, dueDate: event.target.value })} /></label><label><span>Time</span><input type="time" disabled={draft.allDay} value={draft.dueTime ?? ''} onChange={event => setDraft({ ...draft, dueTime: event.target.value })} /></label><label className="all-day"><input type="checkbox" checked={draft.allDay ?? false} onChange={event => setDraft({ ...draft, allDay: event.target.checked })} />All day</label></div><label className="repeat-field"><Icon name="repeat" /><select value={draft.repeat ?? 'Does not repeat'} onChange={event => setDraft({ ...draft, repeat: event.target.value })}><option>Does not repeat</option><option>Daily</option><option>Weekly</option><option>Monthly</option></select></label><textarea value={draft.notes} onChange={event => setDraft({ ...draft, notes: event.target.value })} placeholder="Add description" aria-label="Add description" rows={3} /><label className="task-list-select"><span>Task list</span><select value={draft.listId} onChange={event => setDraft({ ...draft, listId: event.target.value })}>{lists.map(list => <option key={list.id} value={list.id}>{list.title}</option>)}</select></label></div><footer><button type="button" className="text-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit" disabled={!draft.title.trim()}>Save</button></footer></form></div>;
}
