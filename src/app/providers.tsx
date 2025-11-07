'use client';

import { AudioProvider } from '@/features/audio';

import type { ReactNode } from 'react';


type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return <AudioProvider>{children}</AudioProvider>;
}
