import React, { useMemo } from 'react';
import { DefaultSeo, OrganizationJsonLd, BreadcrumbJsonLd } from 'next-seo';
import { useRouter } from 'next/router';
import Head from 'next/head';

import {
  BASE_DEPLOYMENT_URL,
  PROJECT_NAME,
  PRIMARY_IMAGE_URL,
  CORPORATE_CONTACTS,
  SOCIAL_PROFILES,
  DEFAULT_ADDRESS,
  DEFAULT_KEYWORDS
} from './seoConstants';

/** ---------- Props Interface ---------- **/
export interface ISEO {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  keywords?: string | string[];
  imageUrl?: string;
  favicon?: string;
  noIndex?: boolean;
  markdownText?: string;
  breadcrumbs?: { name: string; item: string }[];
  faq?: { question: string; answer: string }[];
  service?: {
    name: string;
    description: string;
    areaServed?: string[];
    providerType?: "LocalBusiness" | "RealEstateAgent" | "HomeAndConstructionBusiness";
  };
  realEstateListing?: {
    name: string;
    description: string;
    addressLocality: string;
    addressRegion: string;
    streetAddress?: string;
    postalCode?: string;
    price?: number;
    priceCurrency?: string;
    propertyType?: string;
    url?: string;
    images?: string[];
    bedrooms?: number;
    bathrooms?: number;
    floorSize?: number;
    floorSizeUnit?: string;
    datePosted?: string;
    latitude?: number;
    longitude?: number;
  };
  product?: {
    name: string;
    description: string;
    image?: string | string[];
    price?: number;
    priceCurrency?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    brand?: string;
    category?: string;
    sku?: string;
    ratingValue?: number;
    reviewCount?: number;
    url?: string;
  };
  itemList?: {
    name: string;
    items: { name: string; url: string; position: number; image?: string }[];
  };
  article?: {
    headline: string;
    datePublished: string;
    dateModified?: string;
    author: { name: string };
    image?: string;
  };
  siteLinksSearchBox?: boolean;
  corporateContact?: {
    telephone: string;
    contactType: string;
    areaServed: string | string[];
    availableLanguage: string | string[];
  }[];
  socialProfiles?: string[];
  openingHours?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
}

/** ---------- Main Component ---------- **/
const SEO: React.FC<ISEO> = (props) => {
  const { isReady, asPath } = useRouter();

  const currentUrl = useMemo(
    () => (isReady ? `${BASE_DEPLOYMENT_URL}${asPath.split('?')[0]}` : ''),
    [isReady, asPath]
  );

  const title = props.title || PROJECT_NAME;
  const description =
    props.description ||
    props.markdownText ||
    'OneCasa is India\'s leading platform for Real Estate, Construction, Interiors, Solar, Furniture & More.';
  const rawKw = props.keywords;
  const keywords = rawKw
    ? Array.isArray(rawKw) ? rawKw.filter(Boolean).join(', ') : rawKw
    : DEFAULT_KEYWORDS;
  const imageURL = props.imageUrl || PRIMARY_IMAGE_URL;
  const favicon = props.favicon || '/favicon.ico';
  const canonical = props.canonicalUrl || currentUrl;
  const noIndex = props.noIndex === true;
  const corporateContacts = props.corporateContact || CORPORATE_CONTACTS;
  const socialProfiles = props.socialProfiles || SOCIAL_PROFILES;
  const address = props.address || DEFAULT_ADDRESS;

  return (
    <>
      <DefaultSeo
        title={title}
        description={description}
        canonical={canonical}
        themeColor="#3586FF"
        openGraph={{
          type: 'website',
          siteName: PROJECT_NAME,
          title,
          description,
          url: canonical,
          images: [
            {
              url: imageURL,
              alt: title,
              width: 1200,
              height: 630,
            },
          ],
        }}
        twitter={{
          cardType: 'summary_large_image',
          handle: '@onecasa_in',
          site: '@onecasa_in',
        }}
        additionalMetaTags={[
          { name: 'keywords', content: keywords },
          { property: 'og:site_name', content: PROJECT_NAME },
          { name: 'apple-mobile-web-app-title', content: PROJECT_NAME },
          { name: 'application-name', content: PROJECT_NAME },
          { name: 'msapplication-TileColor', content: '#3586FF' },
          { name: 'theme-color', content: '#3586FF' },
        ]}
      />

      <OrganizationJsonLd
        type="Corporation"
        id={BASE_DEPLOYMENT_URL}
        logo={PRIMARY_IMAGE_URL}
        legalName="OneCasa Real Estate"
        name="OneCasa Real Estate"
        url={BASE_DEPLOYMENT_URL}
        sameAs={socialProfiles}
        contactPoint={corporateContacts}
        address={address}
      />

      {props.breadcrumbs && props.breadcrumbs.length > 0 && (
        <BreadcrumbJsonLd
          itemListElements={props.breadcrumbs.map((item, index) => ({
            position: index + 1,
            name: item.name,
            item: item.item,
          }))}
        />
      )}

      {props.siteLinksSearchBox !== false && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: PROJECT_NAME,
                url: BASE_DEPLOYMENT_URL,
                potentialAction: {
                  '@type': 'SearchAction',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: `${BASE_DEPLOYMENT_URL}/properties/buy/hyderabad?search={search_term_string}`,
                  },
                  'query-input': 'required name=search_term_string',
                },
              }),
            }}
          />
        </Head>
      )}

      {props.faq && props.faq.length > 0 && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: props.faq.map((q) => ({
                  '@type': 'Question',
                  name: q.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: q.answer,
                  },
                })),
              }),
            }}
          />
        </Head>
      )}

      {props.service && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Service',
                name: props.service.name,
                description: props.service.description,
                provider: {
                  '@type': 'Organization',
                  name: 'OneCasa',
                  url: BASE_DEPLOYMENT_URL,
                  logo: PRIMARY_IMAGE_URL,
                },
                areaServed: (props.service.areaServed || ['India']).map(area => ({
                  '@type': 'City',
                  name: area,
                })),
                serviceType: props.service.providerType || 'RealEstateAgent',
              }),
            }}
          />
        </Head>
      )}

      {props.realEstateListing && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'RealEstateListing',
                name: props.realEstateListing.name,
                description: props.realEstateListing.description,
                url: props.realEstateListing.url || currentUrl,
                ...(props.realEstateListing.datePosted && {
                  datePosted: props.realEstateListing.datePosted,
                }),
                ...(props.realEstateListing.images?.length && {
                  image: props.realEstateListing.images,
                }),
                address: {
                  '@type': 'PostalAddress',
                  ...(props.realEstateListing.streetAddress && {
                    streetAddress: props.realEstateListing.streetAddress,
                  }),
                  addressLocality: props.realEstateListing.addressLocality,
                  addressRegion: props.realEstateListing.addressRegion,
                  ...(props.realEstateListing.postalCode && {
                    postalCode: props.realEstateListing.postalCode,
                  }),
                  addressCountry: 'IN',
                },
                ...(props.realEstateListing.latitude && props.realEstateListing.longitude && {
                  geo: {
                    '@type': 'GeoCoordinates',
                    latitude: props.realEstateListing.latitude,
                    longitude: props.realEstateListing.longitude,
                  },
                }),
                ...(props.realEstateListing.price && {
                  offers: {
                    '@type': 'Offer',
                    price: props.realEstateListing.price,
                    priceCurrency: props.realEstateListing.priceCurrency || 'INR',
                    availability: 'https://schema.org/InStock',
                  },
                }),
                ...(props.realEstateListing.propertyType && {
                  additionalType: props.realEstateListing.propertyType,
                }),
                ...(props.realEstateListing.floorSize && {
                  floorSize: {
                    '@type': 'QuantitativeValue',
                    value: props.realEstateListing.floorSize,
                    unitCode: props.realEstateListing.floorSizeUnit || 'SQF',
                  },
                }),
                ...(props.realEstateListing.bedrooms && {
                  numberOfRooms: props.realEstateListing.bedrooms,
                }),
              }),
            }}
          />
        </Head>
      )}

      {props.product && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Product',
                name: props.product.name,
                description: props.product.description,
                ...(props.product.image && {
                  image: Array.isArray(props.product.image) ? props.product.image : [props.product.image],
                }),
                ...(props.product.brand && {
                  brand: { '@type': 'Brand', name: props.product.brand },
                }),
                ...(props.product.category && { category: props.product.category }),
                ...(props.product.sku && { sku: props.product.sku }),
                ...(props.product.price && {
                  offers: {
                    '@type': 'Offer',
                    price: props.product.price,
                    priceCurrency: props.product.priceCurrency || 'INR',
                    availability: `https://schema.org/${props.product.availability || 'InStock'}`,
                    seller: {
                      '@type': 'Organization',
                      name: 'OneCasa',
                    },
                    url: props.product.url || currentUrl,
                  },
                }),
                ...(props.product.ratingValue && {
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: props.product.ratingValue,
                    reviewCount: props.product.reviewCount || 1,
                  },
                }),
              }),
            }}
          />
        </Head>
      )}

      {props.itemList && props.itemList.items.length > 0 && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                name: props.itemList.name,
                numberOfItems: props.itemList.items.length,
                itemListElement: props.itemList.items.map((item) => ({
                  '@type': 'ListItem',
                  position: item.position,
                  name: item.name,
                  url: item.url,
                  ...(item.image && { image: item.image }),
                })),
              }),
            }}
          />
        </Head>
      )}

      {props.article && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: props.article.headline,
                datePublished: props.article.datePublished,
                dateModified: props.article.dateModified || props.article.datePublished,
                ...(props.article.image && { image: props.article.image }),
                author: {
                  '@type': 'Person',
                  name: props.article.author.name,
                },
                publisher: {
                  '@type': 'Organization',
                  name: 'OneCasa',
                  logo: { '@type': 'ImageObject', url: PRIMARY_IMAGE_URL },
                },
                mainEntityOfPage: currentUrl,
              }),
            }}
          />
        </Head>
      )}

      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'RealEstateAgent',
              '@id': `${BASE_DEPLOYMENT_URL}#organization`,
              name: 'OneCasa',
              description: 'India\'s leading platform for Real Estate, Construction, Interiors, Solar, Furniture & Electronics.',
              url: BASE_DEPLOYMENT_URL,
              telephone: '+918897574909',
              address,
              openingHours: props.openingHours || 'Mo-Su 09:00-18:00',
              sameAs: socialProfiles,
              priceRange: '₹₹',
              image: PRIMARY_IMAGE_URL,
              areaServed: [
                { '@type': 'City', name: 'Hyderabad' },
                { '@type': 'City', name: 'Bangalore' },
                { '@type': 'City', name: 'Mumbai' },
                { '@type': 'City', name: 'Chennai' },
                { '@type': 'City', name: 'Pune' },
                { '@type': 'City', name: 'Delhi' },
              ],
            }),
          }}
        />

        <meta
          name="robots"
          content={noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'}
        />
        <link rel="icon" href={favicon} />
        <link rel="apple-touch-icon" href={favicon} />

        <meta name="geo.region" content="IN-TG" />
        <meta name="geo.placename" content="Hyderabad" />
        <meta name="geo.position" content="17.385044;78.486671" />
        <meta name="ICBM" content="17.385044, 78.486671" />

        <meta name="language" content="en-IN" />
        <meta property="og:locale" content="en_IN" />
      </Head>
    </>
  );
};

export default SEO;
