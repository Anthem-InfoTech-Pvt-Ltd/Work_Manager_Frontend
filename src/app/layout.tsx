import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { GlobalToastContainer } from '@/components/shared/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WorkManager — Modern Project & Task Management Platform',
  description: 'Plan projects, track tasks on interactive Kanban boards, and collaborate seamlessly with your team.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.svg" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <GlobalToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
