import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import apiClient from '@/utils/apiClient';
import PropertyDetailsComponent from '@/components/PropertyDetailsComponent';
import Loader from '@/components/Loader';
import EmptyState from '@/components/EmptyState';
import SEO from '@/components/SEO';
import PropertiesLayoutWrapper from "@/components/Layouts/PropertiesLayout/PropertiesLayoutWrapper";
import toast from 'react-hot-toast';
import { BASE_DEPLOYMENT_URL } from '@/components/SEO/seoConstants';

const CompanyPropertyView = dynamic(
  () => import('@/components/CompanyDetailsPropertyView'),
  { ssr: false }
);

function getLocalityFromDetails(type: 'property' | 'project', details: any) {
    if (!details) return { locality: '', city: '', subLocality: '' };
    if (type === 'property') {
        return {
            locality: details.locationDetails?.locality ?? '',
            city: details.locationDetails?.city ?? '',
            subLocality: details.locationDetails?.subLocality ?? '',
        };
    }
    return {
        locality: details.location?.locality ?? '',
        city: details.location?.city ?? '',
        subLocality: details.location?.subLocality ?? '',
    };
}

function formatPrice(price: number | string | undefined): string {
    if (!price) return '';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return '';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    return `₹${num.toLocaleString('en-IN')}`;
}

function buildPropertySeo(details: any, currentUrl: string) {
    const pd = details.propertyDetails;
    const ld = details.locationDetails;
    const md = details.mediaDetails;
    const pricing = pd?.pricingDetails;
    const residential = pd?.residentialAttributes;

    const propertyName = pd?.propertyName || 'Property';
    const city = ld?.city || '';
    const locality = ld?.locality || '';
    const state = ld?.state || '';
    const bhk = residential?.bhk || '';
    const propertyType = pd?.propertyType || '';
    const price = pricing?.expectedPrice || pricing?.monthlyRent;
    const priceStr = formatPrice(price);
    const lookingType = details.basicDetails?.lookingType;

    const locationStr = [locality, city].filter(Boolean).join(', ');

    const title = [
        bhk,
        propertyType,
        lookingType === 'Rent' ? 'for Rent' : 'for Sale',
        locationStr ? `in ${locationStr}` : '',
        priceStr ? `| ${priceStr}` : '',
        '| OneCasa',
    ].filter(Boolean).join(' ');

    const description = `${bhk ? bhk + ' ' : ''}${propertyType} ${lookingType === 'Rent' ? 'for rent' : 'for sale'} in ${locationStr}${priceStr ? ` at ${priceStr}` : ''}. ${pd?.description?.slice(0, 120) || 'View photos, floor plan, amenities and more on OneCasa.'}`;

    const images = md?.propertyImages?.length
        ? md.propertyImages.slice(0, 5)
        : [];

    const keywords = [
        `${bhk} ${propertyType} ${city}`.trim(),
        `${propertyType} for ${lookingType === 'Rent' ? 'rent' : 'sale'} ${locality}`,
        `${propertyType} ${city}`,
        `buy property ${city}`,
        locality ? `property in ${locality}` : '',
        `OneCasa ${city}`,
        'real estate India',
    ].filter(Boolean).join(', ');

    return {
        title,
        description,
        imageUrl: images[0] || '/images/logobb.png',
        keywords,
        canonicalUrl: currentUrl,
        breadcrumbs: [
            { name: 'Home', item: `${BASE_DEPLOYMENT_URL}/` },
            { name: 'Properties', item: `${BASE_DEPLOYMENT_URL}/properties` },
            { name: `${city} Properties`, item: `${BASE_DEPLOYMENT_URL}/properties/buy/${city.toLowerCase()}` },
            { name: propertyName, item: currentUrl },
        ],
        realEstateListing: {
            name: `${bhk} ${propertyType} in ${locationStr}`.trim(),
            description,
            addressLocality: locality || city,
            addressRegion: state || city,
            streetAddress: ld?.street || ld?.formattedAddress || '',
            postalCode: ld?.zipCode || '',
            price: price ? Number(price) : undefined,
            priceCurrency: 'INR',
            propertyType,
            url: currentUrl,
            images,
            bedrooms: residential?.bhk ? parseInt(residential.bhk) || undefined : undefined,
            bathrooms: residential?.bathrooms || undefined,
            floorSize: residential?.floorArea?.value ? Number(residential.floorArea.value) : undefined,
            floorSizeUnit: 'SQF',
            datePosted: details.postedDate || undefined,
            latitude: ld?.latitude ? Number(ld.latitude) : undefined,
            longitude: ld?.longitude ? Number(ld.longitude) : undefined,
        },
    };
}

function buildProjectSeo(details: any, currentUrl: string) {
    const projectName = details.projectName || details.name || 'Project';
    const location = details.location;
    const city = location?.city || '';
    const locality = location?.locality || '';
    const locationStr = [locality, city].filter(Boolean).join(', ');
    const images = details.images?.slice(0, 5) || [];

    const title = `${projectName} in ${locationStr} | OneCasa`;
    const description = `Explore ${projectName} in ${locationStr}. View project details, floor plans, pricing, amenities and more on OneCasa.`;

    return {
        title,
        description,
        imageUrl: images[0] || '/images/logobb.png',
        keywords: `${projectName}, ${city} real estate, property ${locality}, OneCasa`,
        canonicalUrl: currentUrl,
        breadcrumbs: [
            { name: 'Home', item: `${BASE_DEPLOYMENT_URL}/` },
            { name: 'Properties', item: `${BASE_DEPLOYMENT_URL}/properties` },
            { name: projectName, item: currentUrl },
        ],
    };
}

const PropertyOrProjectDetailPage = () => {
    const router = useRouter();
    const { type, id, slug, category, city } = router.query;
    const [data, setData] = useState<{ type: 'property' | 'project'; details: any } | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const idStr = Array.isArray(id) ? id[0] : id;
            if (!idStr) {
                setLoading(false);
                return;
            }
            const fetchURL =
                type === 'property'
                    ? `${apiClient.URLS.property}/${idStr}`
                    : `${apiClient.URLS.companyonboarding}/projects/${idStr}`;

            const detailRes = await apiClient.get(fetchURL);
            setData({ type: type as 'property' | 'project', details: detailRes.body });
        } catch (err) {
            console.error('Error fetching property/project details:', err);
            toast.error('Error fetching property/project details');
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!router.isReady) return;
        const slugStr = Array.isArray(id) ? id[0] : id;
        const typeStr = Array.isArray(type) ? type[0] : type;
        if (!slugStr || !typeStr) return;
        fetchDetails();
    }, [id, router.isReady, type]);

    if (loading) return <Loader />;
    if (error || !data?.details) return <EmptyState />;

    const slugStr = Array.isArray(slug) ? slug[0] : slug || '';
    const categoryStr = Array.isArray(category) ? category[0] : category || 'buy';
    const cityStr = Array.isArray(city) ? city[0] : city || '';
    const currentUrl = `${BASE_DEPLOYMENT_URL}/properties/${categoryStr}/${cityStr}/details/${slugStr}`;

    const seoProps = data.type === 'property'
        ? buildPropertySeo(data.details, currentUrl)
        : buildProjectSeo(data.details, currentUrl);

    return (
        <>
            <SEO {...seoProps} />
            <div className="min-h-screen bg-gray-50/80">
                <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-4 py-3 sm:py-5">
                    {data.type === 'property' && <PropertyDetailsComponent property={data.details} />}
                    {data.type === 'project' && <CompanyPropertyView data={data.details} />}
                </div>
            </div>
        </>
    );
};

PropertyOrProjectDetailPage.getLayout = (page: React.ReactNode) => (
    <PropertiesLayoutWrapper isDetailPage={true}>{page}</PropertiesLayoutWrapper>
);

export default PropertyOrProjectDetailPage;
