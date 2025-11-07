'use client';

import type { ReactNode } from 'react';

import { AudioProvider } from '@/features/audio';

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return <AudioProvider>{children}</AudioProvider>;
}

