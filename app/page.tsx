'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type Task = { id: number; title: string; list: string; done: boolean; due?: string; starred?: boolean };

const starterTasks: Task[] = [
  { id: 1, title: 'Siapkan presentasi proyek', list: 'Hari ini', done: false, due: 'Hari ini', starred: true },
  { id: 2, title: 'Balas email dari tim desain', list: 'Hari ini', done: false, due: 'Hari ini' },
  { id: 3, title: 'Review proposal pemasaran', list: 'Hari ini', done: true, due: 'Hari ini' },
  { id: 4, title: 'Beli bahan makanan', list: 'Pribadi', done: false, due: 'Besok' },
  { id: 5, title: 'Rencanakan agenda minggu depan', list: 'Pekerjaan', done: false, due: 'Jumat' },
];
const lists = ['Hari ini', 'Pekerjaan', 'Pribadi'];
const Icon = ({ children }: { children: React.ReactNode }) => <span aria-hidden="true" className="icon">{children}</span>;

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(starterTasks);
  const [selectedList, setSelectedList] = useState('Hari ini');
  const [newTask, setNewTask] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const saved = window.localStorage.getItem('rapi-tasks'); if (saved) try { setTasks(JSON.parse(saved)); } catch {} setLoaded(true); }, []);
  useEffect(() => { if (loaded) window.localStorage.setItem('rapi-tasks', JSON.stringify(tasks)); }, [tasks, loaded]);
  const visibleTasks = useMemo(() => selectedList === 'Berbintang' ? tasks.filter(t => t.starred) : selectedList === 'Selesai' ? tasks.filter(t => t.done) : tasks.filter(t => t.list === selectedList), [selectedList, tasks]);
  const activeTasks = visibleTasks.filter(t => !t.done);
  const completeTasks = visibleTasks.filter(t => t.done);
  const heading = selectedList === 'Selesai' ? 'Tugas selesai' : selectedList;
  const isAllView = selectedList === 'Berbintang' || selectedList === 'Selesai';
  function addTask(event: FormEvent) { event.preventDefault(); const title = newTask.trim(); if (!title) return; const list = isAllView ? 'Hari ini' : selectedList; setTasks(current => [{ id: Date.now(), title, list, done: false, due: 'Hari ini' }, ...current]); setNewTask(''); }
  const toggleTask = (id: number) => setTasks(current => current.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const toggleStar = (id: number) => setTasks(current => current.map(t => t.id === id ? { ...t, starred: !t.starred } : t));
  const removeTask = (id: number) => setTasks(current => current.filter(t => t.id !== id));
  return <main className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => setSelectedList('Hari ini')} aria-label="Buka Hari ini"><span className="brand-mark">✓</span><span>rapi<span className="brand-light">tasks</span></span></button>
      <div className="top-actions"><button className="round-button" aria-label="Cari tugas"><Icon>⌕</Icon></button><button className="round-button" aria-label="Bantuan"><Icon>?</Icon></button><button className="avatar" aria-label="Profil pengguna">S</button></div>
    </header>
    <div className="workspace">
      <aside className="sidebar">
        <nav aria-label="Navigasi daftar tugas">
          <button className={`nav-item ${selectedList === 'Hari ini' ? 'selected' : ''}`} onClick={() => setSelectedList('Hari ini')}><Icon>◷</Icon>Hari ini <span>{tasks.filter(t => t.list === 'Hari ini' && !t.done).length}</span></button>
          <button className={`nav-item ${selectedList === 'Berbintang' ? 'selected' : ''}`} onClick={() => setSelectedList('Berbintang')}><Icon>☆</Icon>Berbintang <span>{tasks.filter(t => t.starred && !t.done).length}</span></button>
          <button className={`nav-item ${selectedList === 'Selesai' ? 'selected' : ''}`} onClick={() => setSelectedList('Selesai')}><Icon>✓</Icon>Selesai</button>
        </nav>
        <div className="sidebar-divider" /><div className="list-label">DAFTAR SAYA</div>
        <nav aria-label="Daftar saya">{lists.map(list => <button key={list} className={`nav-item ${selectedList === list ? 'selected' : ''}`} onClick={() => setSelectedList(list)}><span className="list-dot" />{list}<span>{tasks.filter(t => t.list === list && !t.done).length}</span></button>)}</nav>
        <button className="new-list" onClick={() => alert('Daftar baru dapat ditambahkan di versi berikutnya.')}><Icon>＋</Icon> Daftar baru</button>
      </aside>
      <section className="content" aria-labelledby="page-title">
        <div className="content-heading"><div><p className="eyebrow">{selectedList === 'Hari ini' ? 'KAMIS, 27 AGUSTUS' : 'DAFTAR TUGAS'}</p><h1 id="page-title">{heading}</h1></div><div className="view-controls"><button className="round-button" aria-label="Urutkan tugas"><Icon>↕</Icon></button><div className="menu-wrap"><button className="round-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Opsi daftar"><Icon>⋮</Icon></button>{menuOpen && <div className="menu"><button onClick={() => { setTasks([]); setMenuOpen(false); }}>Hapus semua tugas</button></div>}</div></div></div>
        {selectedList === 'Hari ini' && <section className="focus-card" aria-label="Ringkasan fokus hari ini"><div className="focus-icon">✦</div><div><strong>Fokus kecil, hasil besar.</strong><p>{activeTasks.length} tugas aktif menunggu perhatianmu hari ini.</p></div></section>}
        <form className="add-task" onSubmit={addTask}><span className="add-icon">＋</span><input value={newTask} onChange={event => setNewTask(event.target.value)} placeholder="Tambahkan tugas" aria-label="Judul tugas baru" /><button type="submit">Tambah</button></form>
        <div className="task-list">{activeTasks.length === 0 && <p className="empty-state">Semua beres di daftar ini. Tambahkan tugas baru untuk memulai.</p>}{activeTasks.map(task => <TaskRow key={task.id} task={task} onToggle={toggleTask} onStar={toggleStar} onRemove={removeTask} />)}</div>
        {completeTasks.length > 0 && <details className="completed" open={selectedList === 'Selesai'}><summary>{completeTasks.length} selesai</summary>{completeTasks.map(task => <TaskRow key={task.id} task={task} onToggle={toggleTask} onStar={toggleStar} onRemove={removeTask} />)}</details>}
      </section>
    </div>
  </main>;
}

function TaskRow({ task, onToggle, onStar, onRemove }: { task: Task; onToggle: (id: number) => void; onStar: (id: number) => void; onRemove: (id: number) => void }) {
  return <article className={`task-row ${task.done ? 'done' : ''}`}><button className="check" onClick={() => onToggle(task.id)} aria-label={task.done ? `Tandai ${task.title} belum selesai` : `Selesaikan ${task.title}`}>{task.done && '✓'}</button><div className="task-copy"><strong>{task.title}</strong>{task.due && <span className="due">◷ {task.due}</span>}</div><button className={`star ${task.starred ? 'starred' : ''}`} onClick={() => onStar(task.id)} aria-label="Tandai berbintang">{task.starred ? '★' : '☆'}</button><button className="delete" onClick={() => onRemove(task.id)} aria-label={`Hapus ${task.title}`}>×</button></article>;
}
