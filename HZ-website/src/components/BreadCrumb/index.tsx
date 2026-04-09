import Head from "next/head";

const Breadcrumbs = ({ url }: any) => (
    <Head>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": 1,
                            "name": "Home",
                            "item": "https://houznext.com/"
                        },
                        {
                            "@type": "ListItem",
                            "position": 2,
                            "name": "Properties",
                            "item": `https://houznext.com/${url}`
                        }
                    ]
                })
            }}
        />
    </Head>
);

export default Breadcrumbs;
