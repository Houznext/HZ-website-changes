import Button from '@/common/Button';
import SectionSkeleton from '@/common/Skeleton';
import CompanyPropertyView from '@/components/CompanyDetailsPropertyView';
import PropertyDetailsComponent from '@/components/PropertyDetailsComponent';
import SEO from '@/components/SEO';

import apiClient from '@/utils/apiClient';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react'

const PropertyDetailsView = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [data, setData] = useState<any>(null);
    const [retry, setRetry] = useState(0);
    const pathname = usePathname() || '';
    const searchParams = useSearchParams();

    const typeFromQuery = searchParams?.get('type') as 'property' | 'project';
    const fetchDetails = useCallback(async (id: string, type: 'property' | 'project') => {
        setLoading(true);
        try {
            const url = type === 'property'
                ? `${apiClient.URLS.property}/${id}`
                : `${apiClient.URLS.companyonboarding}/projects/${id}`;

            const response = await apiClient.get(url);
            setError(null);
            setData({ type, details: response.body });
        } catch (error) {
            setError(error);
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const segments = pathname.split('/');
        const id = segments.pop();
        const type = typeFromQuery ?? 'property';

        if (id) {
            fetchDetails(id, type as 'property' | 'project');
        }
    }, [pathname, retry, typeFromQuery]);

    if (loading) {
        return (
            <SectionSkeleton
                type={typeFromQuery === 'project' ? 'companyProjectDetail' : 'propertyDetailPage'}
            />
        );
    }

    const seoTags = data?.type === 'property' && (
        <SEO
            title={`${data.details.propertyDetails?.propertyName} | OneCasa`}
            description={`BHK: ${data.details.propertyDetails?.residentialAttributes?.bhk} | ${data.details.locationDetails?.locality}, ${data.details.locationDetails?.city} | Price: ₹${data.details.propertyDetails?.pricingDetails?.expectedPrice}`}
            imageUrl={data.details.mediaDetails?.propertyImages?.[0] || "/fallback.jpg"}   // ✅ Correct prop
            keywords="apartments, villas, rent, buy, OneCasa, real estate, property listing, residential homes"
            favicon="/images/logobb.png"
            breadcrumbs={[
                { name: "Home", item: "https://www.onecasa.in" },
                { name: "Properties", item: "https://www.onecasa.in/properties" },
                {
                    name: data.details.propertyDetails?.propertyName || "Property Details",
                    item: `https://www.onecasa.in/properties/${data.details.id}`,
                },
            ]}
        />

    );


    if (error) {
        return <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100">
            <h1 className="text-2xl font-semibold text-[#3586FF] mb-4">Something went wrong, try again</h1>
            <Button
                onClick={() => setRetry(prev => prev + 1)}
                className="px-4 py-2 bg-[#3586FF] text-white font-medium rounded shadow hover:bg-[#3586FF]focus:outline-none focus:ring focus:ring-blue-300"
            >
                Retry
            </Button>
        </div>

    }
    return (

        <>
            {seoTags}
            {data?.type === 'property' && <PropertyDetailsComponent property={data.details} />}
            {data?.type === 'project' && <CompanyPropertyView data={data.details} />}
        </>
    )
}

export default PropertyDetailsView