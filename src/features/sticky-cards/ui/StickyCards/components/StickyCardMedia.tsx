import Image from 'next/image';

import {
  DatabaseCRUD,
  MicroservicesChart,
  SkillsCharts,
  ThreeJsCanvas,
  VideoGallery,
} from '@/shared/ui';
import { AIPhotoGallery } from '@/shared/ui/AIPhotoGallery/AIPhotoGallery';

import { isProjectGalleryCard } from '../../../model/projectGallery';
import { ProjectGallery } from '../../ProjectGallery/ProjectGallery';
import styles from '../StickyCards.module.css';

import type { StickyCardMediaProps } from '../types/stickyCard.types';
import type { ReactNode } from 'react';

const AI_PHOTO_ITEMS = [
  '/img/catalog-2/ai-photo-1.webp',
  '/img/catalog-2/ai-photo-2.webp',
  '/img/catalog-2/ai-photo-3.webp',
  '/img/catalog-2/ai-photo-4.webp',
  '/img/catalog-2/ai-photo-5.webp',
  '/img/catalog-2/ai-photo-6.webp',
  '/img/catalog-2/ai-photo-7.webp',
  '/img/catalog-2/ai-photo-8.webp',
];

const AI_VIDEO_ITEMS = [
  '/videos/video-1.mp4',
  '/videos/video-2.mp4',
  '/videos/video-3.mp4',
  '/videos/video-4.mp4',
  '/videos/video-5.mp4',
  '/videos/video-6.mp4',
  '/videos/video-7.mp4',
  '/videos/video-8.mp4',
];

function ProjectCardImage({ cardData }: StickyCardMediaProps) {
  return (
    <div className={styles.stickyCardImg}>
      <Image
        src={cardData.image}
        alt={cardData.title}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}

function ProjectCardImageLink({ cardData }: StickyCardMediaProps) {
  return (
    <a
      href={cardData.image}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.stickyCardImg}
      title={`View ${cardData.title} in full size`}
    >
      <Image
        src={cardData.image}
        alt={cardData.title}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </a>
  );
}

function renderFirstCardMedia({ cardData, catalogId }: StickyCardMediaProps) {
  if (catalogId === 'ai-tools') {
    return <AIPhotoGallery items={AI_PHOTO_ITEMS} />;
  }
  if (catalogId === 'advanced-tech') {
    return <ThreeJsCanvas className={styles.stickyCardImg} />;
  }

  return <ProjectCardImage cardData={cardData} />;
}

function renderSecondCardMedia({ cardData, catalogId }: StickyCardMediaProps) {
  if (catalogId === 'advanced-tech') {
    return <SkillsCharts />;
  }
  if (catalogId === 'ai-tools') {
    return (
      <VideoGallery
        items={AI_VIDEO_ITEMS}
        layout="vertical"
        aspectRatio="landscape"
        animationDirection="horizontal"
        columns={2}
      />
    );
  }

  return <ProjectCardImageLink cardData={cardData} />;
}

interface StandardCardMediaProps extends StickyCardMediaProps {
  advancedTechMedia?: ReactNode;
}

function renderStandardCardMedia({
  cardData,
  catalogId,
  advancedTechMedia,
}: StandardCardMediaProps) {
  if (catalogId === 'advanced-tech' && advancedTechMedia) {
    return advancedTechMedia;
  }

  return <ProjectCardImageLink cardData={cardData} />;
}

export function StickyCardMedia({ cardData, catalogId }: StickyCardMediaProps) {
  if (isProjectGalleryCard(catalogId, cardData.index)) {
    return (
      <ProjectGallery
        title={cardData.title}
        description={cardData.description}
        slidesData={cardData.slides}
      />
    );
  }
  if (cardData.index === '01') {
    return renderFirstCardMedia({ cardData, catalogId });
  }
  if (cardData.index === '02') {
    return renderSecondCardMedia({ cardData, catalogId });
  }
  if (cardData.index === '03') {
    return renderStandardCardMedia({
      cardData,
      catalogId,
      advancedTechMedia: <MicroservicesChart />,
    });
  }

  return renderStandardCardMedia({
    cardData,
    catalogId,
    advancedTechMedia: cardData.index === '04' ? <DatabaseCRUD /> : undefined,
  });
}
