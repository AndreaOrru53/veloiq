import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'VELOIQ — Ride smarter', description: 'Il tuo assistente intelligente per il ciclismo.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="it"><body>{children}</body></html>;
}
