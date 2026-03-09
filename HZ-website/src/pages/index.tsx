import Homepage from "@/components/Homepage";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import SEO from '@/components/SEO';

import WelcomeModal from "@/components/welcomeModal";
import apiClient from "@/utils/apiClient";

function Home({ initialBlogs }: { initialBlogs: any[] }) {

  return (
    <div className="">
      <WelcomeModal />
      <SEO
        title="Houznext - Premium Interior Design Platform"
        description="Houznext delivers premium interior design, transparent project tracking, cost estimation, and referral rewards for modern homeowners."
        keywords="interior design, interior cost estimator, interior tracking, houznext interiors, home interiors"
        breadcrumbs={[
          { name: 'Home', item: 'https://www.houznext.com' }
        ]}
        faq={[
          {
            question: "What services does Houznext offer?",
            answer: "Houznext provides premium interior design services with interior cost estimation, project progress tracking, and customer dashboard visibility."
          },
          {
            question: "How can I track my interior project progress?",
            answer: "After login, go to your customer dashboard and open Interior Tracking to see latest updates from the project team."
          }
        ]}
        service={{
          name: "Interior Design and Execution",
          description: "End-to-end interior design and execution with milestone-based customer tracking",
          areaServed: ["India"],
          providerType: "HomeAndConstructionBusiness"
        }}
        siteLinksSearchBox={true}
      />

      <Homepage initialBlogs={initialBlogs} />
    </div>
  );
}

export async function getStaticProps() {
  try {
    const res = await apiClient.get(apiClient.URLS.blogs, {});
    const blogs = res.body?.blogs || [];
    return {
      props: {
        initialBlogs: blogs,
      },
      revalidate: 800,
    };
  } catch (error) {
    console.error("Error fetching blogs for homepage:", error);
    return {
      props: {
        initialBlogs: [],
      },
      revalidate: 600,
    };
  }
}

export default withGeneralLayout(Home);
