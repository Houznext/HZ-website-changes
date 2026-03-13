import Link from "next/link";
import Image from "next/image";
const GeneralFooter = () => {
  const contactDetails = [
    "Phone :8897574909,  8639820425",
    "Monday to Sunday ( 9:00 AM - 9:00 PM IST )",
    "Email : support@houznext.com",
  ];

  const CompanyDreamCasaLinks = [
    {
      heading: "PROPERTY SERVICES", // ← CHANGED
      links: [
        {
          label: "Buy Properties",
          url: "/properties",
        },
        {
          label: "Hyderabad Properties",
          url: "/properties/hyderabad", // ← ADDED
        },
        {
          label: "Bangalore Properties",
          url: "/properties/bangalore", // ← ADDED
        },
        {
          label: "Rent Properties",
          url: "/properties?lookingType=rent", // ← ADDED
        },
        {
          label: "List Your Property",
          url: "/post-property/details",
        },
      ],
    },
    {
      heading: "HOME SERVICES", // ← CHANGED
      links: [
        {
          label: "Interior Design",
          url: "/interiors",
        },
        {
          label: "Construction", // ← ADDED
          url: "/services/construction-for-business",
        },
        {
          label: "Solar Solutions", // ← ADDED
          url: "/solar",
        },
        {
          label: "Custom Builder",
          url: "/custom-builder",
        },
        {
          label: "Legal Services",
          url: "/legalservices",
        },
      ],
    },
    {
      heading: "COMPANY",
      links: [
        {
          label: "About us",
          url: "/about-us",
        },
        {
          label: "Blogs",
          url: "/blogs",
        },
        {
          label: "Testimonials",
          url: "/user/testimonials",
        },
        {
          label: "Careers with us",
          url: "/careers",
        },
        {
          label: "Contact Us",
          url: "/contact-us",
        },
        {
          label: "Refer & Earn",
          url: "/referandearn",
        },
        {
          label: "Terms & Conditions",
          url: "/terms-and-condition",
        },
        {
          label: "Privacy Policy",
          url: "/privacy-policy",
        },
      ],
    }
  ];
  const socialLinks = {
    heading: "Connect with us",
    links: [
      {
        imageLink: "/icons/social-links/linkedin.svg",
        url: "https://www.houznext.com/",
      },
      {
        imageLink: "/icons/social-links/whatsapp.svg",
        url: "https://wa.me/918897574909",
      },
      {
        imageLink: "/icons/social-links/instagram.svg",
        url: "https://www.instagram.com/houznext/",
      },
      {
        imageLink: "/icons/social-links/facebook.svg",
        url: "https://www.facebook.com/houznext",
      },
      {
        imageLink: "/icons/social-links/youtube.svg",
        url: "https://www.youtube.com/@houznext",
      },
      {
        imageLink: "/icons/social-links/twitter.svg",
        url: "https://www.linkedin.com/company/houznext/",
      },
    ],
  };

  return (
    <div className="w-full bg-[#081221] md:divide-x p-6 md:p-10 max-md:mb-7 md:divide-slate-500 grid grid-flow-row md:grid-flow-col md:auto-cols-[minmax(min-content,auto)] gap-y-3 md:gap-y-0 divide-y md:divide-y-0">
      <div className="w-full flex justify-start items-start">
        <div className="flex w-fit  flex-col gap-3">
          {
            <span className="text-[#FBFBFB] leading-[22.8px] md:text-base text-[14px] font-bold">
              CONTACT DETAILS :
            </span>
          }
          <div className="flex flex-col gap-2">
            {contactDetails.map((label, index) => {
              return (
                <span
                  className="text-[#FBFBFB] leading-[19.95px] md:text-sm text-[12px] font-medium"
                  key={`index-${index}-link-${label}`}
                >
                  {label}
                </span>
              );
            })}
          </div>
          <div className="flex flex-col gap-2">
            {
              <span className="text-[#FBFBFB] leading-[22.8px] md:text-sm text-[12px] font-medium">
                {socialLinks?.heading}
              </span>
            }
            <div className="flex gap-2">
              {socialLinks?.links.map((link, index) => {
                const platformName = link.imageLink
                  .split("/")
                  .pop()
                  ?.split(".")[0]
                  ?.replace(/-/g, " ");

                return (
                  <Link
                    className="text-[#FBFBFB] leading-[19.95px] text-sm font-medium"
                    key={`index-${index}-link-${link.imageLink}`}
                    href={link.url}
                    aria-label={`Visit ${platformName}`}
                  >
                    <Image src={link.imageLink}
                      alt={platformName ? `${platformName} icon` : "social icon"} width={20} height={20} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {CompanyDreamCasaLinks.map((section, index: number) => {
        return (
          <div
            key={`index-links-${section?.heading}-${index}`}
            className="w-full flex py-5 md:py-0 justify-start md:justify-center items-start"
          >
            <div className="flex w-fit  flex-col gap-3">
              {
                <span className="text-[#FBFBFB] leading-[22.8px]  md:text-base text-[14px] font-bold">
                  {section?.heading}
                </span>
              }
              <div className="flex flex-row flex-wrap md:flex-none md:flex-col gap-x-2 gap-y-[6px]  md:gap-2">
                {section.links.map((link, index) => {
                  return (
                    <Link
                      className="whitespace-nowrap md:whitespace-normal hover:text-[#3586FF] text-[#FBFBFB] leading-[19.95px] md:text-sm text-[12px] font-medium"
                      key={`index-${index}-link-${link.label}`}
                      href={link.url}
                      aria-label={link.label}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GeneralFooter;
