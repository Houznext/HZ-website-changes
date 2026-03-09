import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import InteriorsDetailsComp from "@/components/Products/components/SubServices/InteriorsComponent/InteriorsDetailsComp";
import { useRouter } from "next/router";
import SEO from '@/components/SEO';

const InteriorDetails = () => {
  const router = useRouter();
  const { details } = router.query;

  const parsedDetails = details
    ? Object.fromEntries(new URLSearchParams(details as string))
    : null;


  return (
    <div>
      <SEO
        title={`${parsedDetails?.title || "Interior Design Details"
          } | Stylish & Functional Interiors`}
        description={`${parsedDetails?.description ||
          "Explore detailed interior design ideas with high-quality images, descriptions, and expert recommendations."
          } Get inspired for your home or office interiors.`}
        keywords={`Interior Design, ${parsedDetails?.title || "Interior Details"
          }, Home Interiors, Modern Designs, Custom Interiors, Interior Decor`}
        imageUrl={`https://www.onecasa.in/interiors/${details}`}
      />
      <div className="md:p-6 p-3">
        {parsedDetails && (
          <InteriorsDetailsComp
            imageUrl={parsedDetails.imageUrl}
            title={parsedDetails.title}
            description={parsedDetails.description}
            id={Number(parsedDetails.id)}

          />
        )}
      </div>
    </div>
  );
};

export default withGeneralLayout(InteriorDetails);
