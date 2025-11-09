import { use } from 'react';
import { after } from 'next/server';

import { getCatalogById } from '@/shared/lib/catalog-loader';
import { createLogger } from '@/shared/lib';

import { CatalogPageClient } from './CatalogPageClient';

import type { Metadata } from 'next';

const logger = createLogger().child({ page: 'StickyPage' });

interface StickyPageProps {
  params: Promise<{ catalogId: string }>;
}

export default function StickyPage({ params }: StickyPageProps) {
  const unwrappedParams = use(params);
  const catalogId = unwrappedParams.catalogId;

  const catalog = getCatalogById(catalogId);

  // Логирование после отправки ответа (Next.js 15.1 after() API)
  after(async () => {
    logger.info('Catalog page rendered', { catalogId, found: !!catalog });
  });

  if (!catalog) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1>Catalog not found</h1>
      </div>
    );
  }

  return <CatalogPageClient catalog={catalog} catalogId={catalogId} />;
}

export async function generateMetadata({ params }: StickyPageProps): Promise<Metadata> {
  const unwrappedParams = await params;
  const catalog = getCatalogById(unwrappedParams.catalogId);

  if (!catalog) {
    return {
      title: 'Catalog not found',
    };
  }

  return {
    title: catalog.seo.title,
    description: catalog.seo.description,
    keywords: catalog.seo.keywords,
  };
}
