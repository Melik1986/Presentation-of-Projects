import {
  ScrollingBadge,
  SpiralAnimation,
} from '@/shared/ui';

import styles from '../StickyCards.module.css';

import type { StickyCardIndexProps } from '../types/stickyCard.types';

const AI_TOOLS = [
  'SORA AI',
  'Recraft',
  'KREA',
  'FLORA',
  'Weavy AI',
  'Midjourney',
  'DALL-E 3',
  'Stable Diffusion',
  'RunwayML',
  'Pika Labs',
];

function AIToolsBadges({ isMobile }: Pick<StickyCardIndexProps, 'isMobile'>) {
  return (
    <div className={styles.aiToolsBadges}>
      <ScrollingBadge
        items={AI_TOOLS}
        direction={isMobile ? 'horizontal' : 'vertical'}
        speed={12}
        className={styles.badge1}
      />
      <ScrollingBadge
        items={AI_TOOLS}
        direction={isMobile ? 'horizontal' : 'vertical'}
        speed={14}
        className={styles.badge2}
      />
    </div>
  );
}

export function StickyCardIndex({ index, catalogId, isMobile }: StickyCardIndexProps) {
  return (
    <div className={styles.stickyCardIndex}>
      <h1>{index}</h1>

      {catalogId === 'ai-tools' && (index === '01' || index === '02') && (
        <AIToolsBadges isMobile={isMobile} />
      )}

      {catalogId === 'advanced-tech' && index === '01' && <SpiralAnimation />}
    </div>
  );
}
