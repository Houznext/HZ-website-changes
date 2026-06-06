import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { SeoBuyLanding } from '@/components/property/SeoBuyLanding';
import { fetchPageSeo } from '@/lib/fetchPageSeo';
import { fetchSeoGeo } from '@/lib/fetchSeoGeo';
import {
  allSeoLandingPaths,
  resolveSeoCity,
  resolveSeoType,
  seoLandingPath,
  type SeoCitySlug,
  type SeoTypeSlug,
} from '@/lib/seoLanding';

type Props = {
  citySlug: SeoCitySlug;
  typeSlug: SeoTypeSlug;
  initialPageSeo: Awaited<ReturnType<typeof fetchPageSeo>>;
  initialSeoGeo: Awaited<ReturnType<typeof fetchSeoGeo>>;
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: allSeoLandingPaths().map(({ city, type }) => ({ params: { city, type } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async (ctx) => {
  const citySlug = String(ctx.params?.city ?? '');
  const typeSlug = String(ctx.params?.type ?? '');
  const city = resolveSeoCity(citySlug);
  const type = resolveSeoType(typeSlug);
  if (!city || !type) return { notFound: true };

  const path = seoLandingPath(city.slug, type.slug);
  const [initialPageSeo, initialSeoGeo] = await Promise.all([fetchPageSeo(path), fetchSeoGeo()]);

  return {
    props: {
      citySlug: city.slug,
      typeSlug: type.slug,
      initialPageSeo,
      initialSeoGeo,
    },
    revalidate: 3600,
  };
};

export default function SeoBuyLandingPage({
  citySlug,
  typeSlug,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return <SeoBuyLanding citySlug={citySlug} typeSlug={typeSlug} />;
}
