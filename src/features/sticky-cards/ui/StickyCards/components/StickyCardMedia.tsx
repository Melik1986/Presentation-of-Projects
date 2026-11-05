import Image from 'next/image';

import {
  AnimatedImage,
  DatabaseCRUD,
  MicroservicesChart,
  SkillsCharts,
  SplineModel,
  ThreeJsCanvas,
  VideoGallery,
} from '@/shared/ui';
import { AIPhotoGallery } from '@/shared/ui/AIPhotoGallery/AIPhotoGallery';

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

function FigmaImage({ cardData }: StickyCardMediaProps) {
  return (
    <AnimatedImage
      src="/img/placeholder.png"
      alt={cardData.title}
      direction="right-to-left"
      duration={1.2}
      delay={0.5}
      catalogId="figma-design"
      cardIndex={cardData.index}
      enableAnimation
    />
  );
}

function renderFirstCardMedia({ cardData, catalogId }: StickyCardMediaProps) {
  if (catalogId === 'web-apps') {
    return <ProjectGallery title={cardData.title} description={cardData.description} />;
  }
  if (catalogId === 'ai-tools') {
    return <AIPhotoGallery items={AI_PHOTO_ITEMS} />;
  }
  if (catalogId === 'figma-design') {
    return (
      <SplineModel
        scene="/spline/scene.design.splinecode"
        className={styles.stickyCardImg}
        zoom={0.8}
      />
    );
  }
  if (catalogId === 'advanced-tech') {
    return <ThreeJsCanvas className={styles.stickyCardImg} />;
  }

  return <ProjectCardImage cardData={cardData} />;
}

function renderSecondCardMedia({ cardData, catalogId }: StickyCardMediaProps) {
  if (catalogId === 'web-apps') {
    return <ProjectGallery title={cardData.title} description={cardData.description} />;
  }
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
  if (catalogId === 'figma-design') {
    return (
      <AnimatedImage
        src="/img/catalog-3/card-2.png"
        alt={cardData.title}
        direction="right-to-left"
        duration={1.2}
        delay={0.5}
        catalogId={catalogId}
        cardIndex={cardData.index}
        enableAnimation
      />
    );
  }

  return <ProjectCardImageLink cardData={cardData} />;
}

function renderWebAppsGallery({ cardData, catalogId }: StickyCardMediaProps) {
  if (catalogId !== 'web-apps') {
    return null;
  }

  return <ProjectGallery title={cardData.title} description={cardData.description} />;
}

function renderLinkedProjectImage(cardData: StickyCardMediaProps['cardData']) {
  return <ProjectCardImageLink cardData={cardData} />;
}

interface StandardCardMediaProps extends StickyCardMediaProps {
  advancedTechMedia?: ReactNode;
  figmaMedia?: ReactNode;
}

function renderStandardCardMedia({
  cardData,
  catalogId,
  advancedTechMedia,
  figmaMedia,
}: StandardCardMediaProps) {
  const webAppsGallery = renderWebAppsGallery({ cardData, catalogId });
  if (webAppsGallery) {
    return webAppsGallery;
  }
  if (catalogId === 'advanced-tech' && advancedTechMedia) {
    return advancedTechMedia;
  }
  if (catalogId === 'figma-design' && figmaMedia) {
    return figmaMedia;
  }

  return renderLinkedProjectImage(cardData);
}

function FigmaCardImageLink({ cardData }: Pick<StickyCardMediaProps, 'cardData'>) {
  return (
    <div className={styles.stickyCardImg} data-figma-image-container>
      <a
        href={cardData.image}
        target="_blank"
        rel="noopener noreferrer"
        title={`View ${cardData.title} in full size`}
      >
        <Image
          src={cardData.image}
          alt={cardData.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          data-figma-image
        />
      </a>
    </div>
  );
}

export function StickyCardMedia({ cardData, catalogId }: StickyCardMediaProps) {
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
      figmaMedia: <FigmaImage cardData={cardData} catalogId={catalogId} />,
    });
  }

  return renderStandardCardMedia({
    cardData,
    catalogId,
    advancedTechMedia: cardData.index === '04' ? <DatabaseCRUD /> : undefined,
    figmaMedia: <FigmaCardImageLink cardData={cardData} />,
  });
}
