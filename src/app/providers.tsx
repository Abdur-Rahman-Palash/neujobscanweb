'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
        {children}
        <Toaster />
      </SessionProvider>
    </AuthProvider>
  );
}
