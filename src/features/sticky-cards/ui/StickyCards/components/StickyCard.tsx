import { shouldShowCardCopyDescription } from '../../../model/projectGallery';
import styles from '../StickyCards.module.css';
import { StickyCardIndex } from './StickyCardIndex';
import { StickyCardLinks } from './StickyCardLinks';
import { StickyCardMedia } from './StickyCardMedia';

import type { StickyCardComponentProps } from '../types/stickyCard.types';

export function StickyCard({ cardData, catalogId, isMobile }: StickyCardComponentProps) {
  const contentWrapperClassName = [
    styles.stickyCardContentWrapper,
    catalogId === 'advanced-tech' && cardData.index === '04' && styles.wideContentWrapper,
    catalogId === 'web-apps' && styles.webAppsContentWrapper,
  ]
    .filter(Boolean)
    .join(' ');

  const cardClassName = [
    'sticky-card',
    styles.stickyCard,
    catalogId === 'web-apps' && styles.webAppsCard,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClassName} key={cardData.index} data-card-index={cardData.index}>
      <StickyCardIndex index={cardData.index} catalogId={catalogId} isMobile={isMobile} />

      <div className={styles.stickyCardContent}>
        <div className={contentWrapperClassName}>
          <h1 className={styles.stickyCardHeader}>{cardData.title}</h1>
          <StickyCardMedia cardData={cardData} catalogId={catalogId} />

          <div className={styles.stickyCardCopy}>
            <div className={styles.stickyCardCopyTitle}>
              <StickyCardLinks cardData={cardData} />
            </div>
            {shouldShowCardCopyDescription(catalogId) && (
              <div className={styles.stickyCardCopyDescription}>
                <p>{cardData.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
