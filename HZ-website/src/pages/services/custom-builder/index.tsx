import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import BuildHome from "@/components/Products/components/BuildHome";
import SEO from '@/components/SEO';


const CustomBuilder = () => {
  return (
    <div>
      <SEO
        title="Home Décor, Furniture, Painting & Plumbing Services | Houznext"
        description="Enhance your home with expert home décor, custom furniture, painting, and plumbing services. Transform your space with quality craftsmanship and stylish designs."
        keywords="Home Décor Services, Custom Furniture, Interior Painting, Plumbing Solutions, Home Renovation, Dream Home Interiors"
        imageUrl="https://www.houznext.com/images/logobb.png"
      />
      <BuildHome />
    </div>
  );
};
export default withGeneralLayout(CustomBuilder);
