'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type Task = { id: number; title: string; list: string; done: boolean; due?: string; starred?: boolean };

const starterTasks: Task[] = [
  { id: 1, title: 'Prepare project presentation', list: 'Today', done: false, due: 'Today', starred: true },
  { id: 2, title: 'Reply to the design team', list: 'Today', done: false, due: 'Today' },
  { id: 3, title: 'Review marketing proposal', list: 'Today', done: true, due: 'Today' },
  { id: 4, title: 'Buy groceries', list: 'Personal', done: false, due: 'Tomorrow' },
  { id: 5, title: 'Plan next week’s agenda', list: 'Work', done: false, due: 'Friday' },
];
const lists = ['Today', 'Work', 'Personal'];
const Icon = ({ children }: { children: React.ReactNode }) => <span aria-hidden="true" className="icon">{children}</span>;

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(starterTasks);
  const [selectedList, setSelectedList] = useState('Today');
  const [newTask, setNewTask] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const saved = window.localStorage.getItem('google-tasks-en'); if (saved) try { setTasks(JSON.parse(saved)); } catch {} setLoaded(true); }, []);
  useEffect(() => { if (loaded) window.localStorage.setItem('google-tasks-en', JSON.stringify(tasks)); }, [tasks, loaded]);
  const visibleTasks = useMemo(() => selectedList === 'Starred' ? tasks.filter(t => t.starred) : selectedList === 'Completed' ? tasks.filter(t => t.done) : tasks.filter(t => t.list === selectedList), [selectedList, tasks]);
  const activeTasks = visibleTasks.filter(t => !t.done);
  const completeTasks = visibleTasks.filter(t => t.done);
  const heading = selectedList === 'Completed' ? 'Completed tasks' : selectedList;
  const isAllView = selectedList === 'Starred' || selectedList === 'Completed';
  function addTask(event: FormEvent) { event.preventDefault(); const title = newTask.trim(); if (!title) return; const list = isAllView ? 'Today' : selectedList; setTasks(current => [{ id: Date.now(), title, list, done: false, due: 'Today' }, ...current]); setNewTask(''); }
  const toggleTask = (id: number) => setTasks(current => current.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const toggleStar = (id: number) => setTasks(current => current.map(t => t.id === id ? { ...t, starred: !t.starred } : t));
  const removeTask = (id: number) => setTasks(current => current.filter(t => t.id !== id));
  return <main className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => setSelectedList('Today')} aria-label="Open Today"><span className="brand-mark">✓</span><span>Google <span className="brand-light">Tasks</span></span></button>
      <div className="top-actions"><button className="round-button" aria-label="Search tasks"><Icon>⌕</Icon></button><button className="round-button" aria-label="Help"><Icon>?</Icon></button><button className="avatar" aria-label="User profile">S</button></div>
    </header>
    <div className="workspace">
      <aside className="sidebar">
        <nav aria-label="Task list navigation">
          <button className={`nav-item ${selectedList === 'Today' ? 'selected' : ''}`} onClick={() => setSelectedList('Today')}><Icon>◷</Icon>Today <span>{tasks.filter(t => t.list === 'Today' && !t.done).length}</span></button>
          <button className={`nav-item ${selectedList === 'Starred' ? 'selected' : ''}`} onClick={() => setSelectedList('Starred')}><Icon>☆</Icon>Starred <span>{tasks.filter(t => t.starred && !t.done).length}</span></button>
          <button className={`nav-item ${selectedList === 'Completed' ? 'selected' : ''}`} onClick={() => setSelectedList('Completed')}><Icon>✓</Icon>Completed</button>
        </nav>
        <div className="sidebar-divider" /><div className="list-label">MY LISTS</div>
        <nav aria-label="My lists">{lists.map(list => <button key={list} className={`nav-item ${selectedList === list ? 'selected' : ''}`} onClick={() => setSelectedList(list)}><span className="list-dot" />{list}<span>{tasks.filter(t => t.list === list && !t.done).length}</span></button>)}</nav>
        <button className="new-list" onClick={() => alert('Custom lists are coming in a future version.')}><Icon>＋</Icon> New list</button>
      </aside>
      <section className="content" aria-labelledby="page-title">
        <div className="content-heading"><div><p className="eyebrow">{selectedList === 'Today' ? 'THURSDAY, AUGUST 27' : 'TASK LIST'}</p><h1 id="page-title">{heading}</h1></div><div className="view-controls"><button className="round-button" aria-label="Sort tasks"><Icon>↕</Icon></button><div className="menu-wrap"><button className="round-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="List options"><Icon>⋮</Icon></button>{menuOpen && <div className="menu"><button onClick={() => { setTasks([]); setMenuOpen(false); }}>Delete all tasks</button></div>}</div></div></div>
        {selectedList === 'Today' && <section className="focus-card" aria-label="Today’s focus summary"><div className="focus-icon">✦</div><div><strong>Small focus, big results.</strong><p>{activeTasks.length} active tasks need your attention today.</p></div></section>}
        <form className="add-task" onSubmit={addTask}><span className="add-icon">＋</span><input value={newTask} onChange={event => setNewTask(event.target.value)} placeholder="Add a task" aria-label="New task title" /><button type="submit">Add</button></form>
        <div className="task-list">{activeTasks.length === 0 && <p className="empty-state">Everything is done here. Add a new task to get started.</p>}{activeTasks.map(task => <TaskRow key={task.id} task={task} onToggle={toggleTask} onStar={toggleStar} onRemove={removeTask} />)}</div>
        {completeTasks.length > 0 && <details className="completed" open={selectedList === 'Completed'}><summary>{completeTasks.length} completed</summary>{completeTasks.map(task => <TaskRow key={task.id} task={task} onToggle={toggleTask} onStar={toggleStar} onRemove={removeTask} />)}</details>}
      </section>
    </div>
  </main>;
}

function TaskRow({ task, onToggle, onStar, onRemove }: { task: Task; onToggle: (id: number) => void; onStar: (id: number) => void; onRemove: (id: number) => void }) {
  return <article className={`task-row ${task.done ? 'done' : ''}`}><button className="check" onClick={() => onToggle(task.id)} aria-label={task.done ? `Mark ${task.title} as incomplete` : `Complete ${task.title}`}>{task.done && '✓'}</button><div className="task-copy"><strong>{task.title}</strong>{task.due && <span className="due">◷ {task.due}</span>}</div><button className={`star ${task.starred ? 'starred' : ''}`} onClick={() => onStar(task.id)} aria-label="Toggle star">{task.starred ? '★' : '☆'}</button><button className="delete" onClick={() => onRemove(task.id)} aria-label={`Delete ${task.title}`}>×</button></article>;
}
