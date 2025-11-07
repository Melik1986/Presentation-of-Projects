import type { Metadata } from 'next';

import { AudioUIPanel } from '@/features/audio';
import { Wildyriftian } from '@/features/effects';

export const metadata: Metadata = {
  title: 'Home',
};

export default function HomePage() {
  return (
    <>
      <Wildyriftian />
      <AudioUIPanel className="audio-panel-fixed" />
    </>
  );
}

