import React from "react";

const realEstateProperties = [
  {
    name: "Property for Sale",
    subList: [
      "Real estate in Delhi",
      "Real estate in Mumbai",
      "Real estate in Gurgaon",
      "Real estate in Bangalore",
      "Real estate in Pune",
      "Real estate in Noida",
      "Real estate in Lucknow",
      "Real estate in Ghaziabad",
      "Real estate in Navi Mumbai",
      "Real estate in Greater Noida",
      "Real estate in Chennai",
      "Real estate in Thane",
      "Real estate in Ahmedabad",
      "Real estate in Jaipur",
      "Real estate in Hyderabad",
    ],
  },
  {
    name: "Flats for Sale",
    subList: [
      "Flats in Delhi",
      "Flats in Mumbai",
      "Flats in Gurgaon",
      "Flats in Bangalore",
      "Flats in Pune",
      "Flats in Noida",
      "Flats in Lucknow",
      "Flats in Ghaziabad",
      "Flats in Navi Mumbai",
      "Flats in Greater Noida",
      "Flats in Chennai",
      "Flats in Thane",
      "Flats in Ahmedabad",
      "Flats in Jaipur",
      "Flats in Hyderabad",
    ],
  },
  {
    name: "Flats for Rent",
    subList: [
      "Flats for Rent in Delhi",
      "Flats for Rent in Mumbai",
      "Flats for Rent in Gurgaon",
      "Flats for Rent in Bangalore",
      "Flats for Rent in Pune",
      "Flats for Rent in Noida",
      "Flats for Rent in Lucknow",
      "Flats for Rent in Ghaziabad",
      "Flats for Rent in Navi Mumbai",
      "Flats for Rent in Greater Noida",
      "Flats for Rent in Chennai",
      "Flats for Rent in Thane",
      "Flats for Rent in Ahmedabad",
      "Flats for Rent in Jaipur",
      "Flats for Rent in Hyderabad",
    ],
  },
  {
    name: "New Projects",
    subList: [
      "New Projects in Delhi",
      "New Projects in Mumbai",
      "New Projects in Gurgaon",
      "New Projects in Bangalore",
      "New Projects in Pune",
      "New Projects in Noida",
      "New Projects in Lucknow",
      "New Projects in Ghaziabad",
      "New Projects in Navi Mumbai",
      "New Projects in Greater Noida",
      "New Projects in Chennai",
      "New Projects in Thane",
      "New Projects in Ahmedabad",
      "New Projects in Jaipur",
      "New Projects in Hyderabad",
    ],
  },
];

const RealEstateProperties = () => {
  return (
    <div className="text-white bg-gray-600 py-10 px-4 md:px-16">
      <p className="text-center text-2xl md:text-3xl font-semibold mb-12">
        Search and Buy Real Estate in Properties
      </p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        {realEstateProperties.map((category, index) => (
          <div key={index}>
            <h3 className="text-[20px] font-Gordita-lg mb-4">
              {category.name}
            </h3>
            <ul className="space-y-2">
              {category.subList.map((item, subIndex) => (
                <li
                  key={subIndex}
                  className="text-md text-gray-300 hover:text-white cursor-pointer transition-all duration-200 transform hover:translate-x-1"
                >
                  <span className="mr-3 text-lg">›</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealEstateProperties;
