import Image from "next/image";
import React from "react";

const solarData = [
  {
    id: 1,
    title: "Project Planning",
    description: "Understanding requirements and mapping out a tailored solar plan.",
    image: "https://cdn.pixabay.com/photo/2017/05/04/16/37/meeting-2284501_640.jpg",
    gradient: "from-[#3586FF] to-cyan-500"
  },
  {
    id: 2,
    title: "Research & Analysis",
    description: "Detailed site survey, cost analysis, and choosing optimal technology.",
    image: "https://cdn.pixabay.com/photo/2024/03/26/11/57/solar-8656654_640.jpg",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    id: 3,
    title: "Solar Installation",
    description: "Professional installation ensuring safety, efficiency, and durability.",
    image: "https://cdn.pixabay.com/photo/2022/10/13/10/24/solar-panel-7518786_640.jpg",
    gradient: "from-orange-500 to-amber-500"
  },
];

const HowItWorks = () => {
  return (
    <section className="py-10 md:py-16 px-4 mx-auto">
      <div className="text-center mb-10 md:mb-16">
        <h1 className="text-[18px] md:text-[24px]  font-bold mb-2 text-[#3E6196]">
          How it Works
        </h1>
        <h2 className="font-regular md:text-[14px] text-[12px] text-[#1C2436] max-w-xl mx-auto">
          Our simple 3-step process to make solar energy accessible and reliable.
        </h2>
        <div className="w-20 h-[3px] bg-[#3586FF] mx-auto mt-3 rounded-full"></div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-10">
        {solarData.map(({ id, title, image, description, gradient }, index) => (
          <React.Fragment key={id}>
            <div className="group relative flex flex-col items-center text-center max-w-[260px] md:max-w-[280px] border border-gray-200 rounded-2xl md:p-4 p-1 shadow-sm hover:shadow-lg transition-all duration-300">

              <div className={`absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center shadow-lg`}>
                <span className="text-white text-[12px] font-bold">0{id}</span>
              </div>

              {/* Image */}
              <div className="relative w-[200px] h-[150px] md:w-[240px] md:h-[170px] rounded-lg overflow-hidden shadow-md mb-4"> <Image src={image} alt={title} fill className="object-cover hover:scale-105 transition-transform duration-500" />

                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              </div>


              <h3 className="text-[16px] md:text-[18px] font-bold text-black mb-2">
                {title}
              </h3>
              <p className="text-[12px] md:text-[14px] font-regular text-[#5C5D5F] leading-relaxed px-2">
                {description}
              </p>



            </div>
            {index < solarData.length - 1 && (
              <div className="hidden md:flex items-center justify-center">
                <div className="relative w-[60px] h-[20px]">
                  <Image
                    src="/images/legalservices/howitworks/arrowicon.png"
                    alt="arrow"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
            {index < solarData.length - 1 && (
              <div className="md:hidden flex items-center justify-center my-3 rotate-90">
                <div className="relative w-[60px] h-[20px]">
                  <Image
                    src="/images/legalservices/howitworks/arrowicon.png"
                    alt="arrow"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;