import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'RapiTasks — Kelola tugas dengan ringkas', description: 'Aplikasi daftar tugas ringan yang terinspirasi dari Google Tasks.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="id"><body>{children}</body></html>; }
