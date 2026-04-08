import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Poseidon - Opposition Research Extraction Tool',
  description: 'Extract attacks and match to targeting universes from opposition research documents',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900">
        {children}
      </body>
    </html>
  );
}
