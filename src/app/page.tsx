import { AudioUIPanel } from '@/features/audio';
import { Wildyriftian } from '@/features/effects';

import type { Metadata } from 'next';

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
