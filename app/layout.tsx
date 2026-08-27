import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Google Tasks — Stay organized', description: 'A lightweight task list inspired by Google Tasks.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
