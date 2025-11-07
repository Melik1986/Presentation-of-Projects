import { use } from 'react';

import { getCatalogById } from '@/shared/lib/catalog-loader';

import { CatalogPageClient } from './CatalogPageClient';

import type { Metadata } from 'next';

interface StickyPageProps {
  params: Promise<{ catalogId: string }>;
}

export default function StickyPage({ params }: StickyPageProps) {
  const unwrappedParams = use(params);
  const catalogId = unwrappedParams.catalogId;

  const catalog = getCatalogById(catalogId);

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
