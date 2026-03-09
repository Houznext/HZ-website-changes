import Button from "@/common/Button";
import Modal from "@/common/Modal";
import Link from "next/link";
import { useState } from "react";
import { MdArrowCircleDown } from "react-icons/md";

export const packagesData = [
  {
    name: "Housing Expert Pro",
    tag: "Recommended",
    tagColor: "bg-[#3586FF] text-white",
    features: [
      "Highest visibility across all listing categories in every locality",
      "Reusable slots - allowing you to post multiple listings",
      "Have maximum impressions of the customers with larger cards and differentiated design",
      "Highlight your brand with 'Housing Expert Pro' tag along with 'Locality Champion' tag",
      "Visibility on Home Page and Search Result Page",
      "Access to on-ground property verification in Tier-1 cities",
      "Unlimited self-verification of properties",
      "Unique feature to showcase 3 properties in one listing"
    ]
  },
  {
    name: "Housing Expert",
    tag: "Enhanced",
    tagColor: "bg-orange-400 text-white",
    features: [

      "Highest visibility across all listing categories in every locality",
      "Reusable slots - allowing you to post multiple listings",
      "Have maximum impressions of the customers with larger cards and differentiated design",
      "Highlight your brand with 'Housing Expert Pro' tag along with 'Locality Champion' tag",
      "Visibility on Home Page and Search Result Page",
      "Access to on-ground property verification in Tier-1 cities",
      "Unlimited self-verification of properties",
      "Unique feature to showcase 3 properties in one listing"
    ]
  },
  {
    name: "Premier",
    tag: "Value",
    tagColor: "bg-green-400 text-white",
    features: [
      "Highest visibility across all listing categories in every locality",
      "Reusable slots - allowing you to post multiple listings",
      "Have maximum impressions of the customers with larger cards and differentiated design",
      "Highlight your brand with 'Housing Expert Pro' tag along with 'Locality Champion' tag",
      "Visibility on Home Page and Search Result Page",
      "Access to on-ground property verification in Tier-1 cities",
      "Unlimited self-verification of properties",
      "Unique feature to showcase 3 properties in one listing"
    ]
  },
  {
    name: "Housing Select",
    tag: "Starter",
    tagColor: "bg-gray-300 text-black",
    features: [
      "Highest visibility across all listing categories in every locality",
      "Reusable slots - allowing you to post multiple listings",
      "Have maximum impressions of the customers with larger cards and differentiated design",
      "Highlight your brand with 'Housing Expert Pro' tag along with 'Locality Champion' tag",
      "Visibility on Home Page and Search Result Page",
      "Access to on-ground property verification in Tier-1 cities",
      "Unlimited self-verification of properties",
      "Unique feature to showcase 3 properties in one listing"
    ]
  }
];

const PackageBroker = () => {

  const [modal, setModal] = useState<boolean>(false);
  const [demoModal, setDemoModal] = useState<boolean>(false)


  const handleView = () => {


    setModal(true);
  };
  const handleDemoModalView = (job: any) => {
    console.log("sdasda", job);

    setDemoModal(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {packagesData.map((pkg, index) => (
        <div key={index} className="border rounded-2xl shadow-lg p-5 flex flex-col justify-between bg-white">

          <div className="relative border rounded-2xl shadow-lg p-5 flex flex-col justify-between bg-white">

            <div className={`absolute top-0 right-0 text-sm font-regular px-3 py-1 rounded ${pkg.tagColor}`}>
              {pkg.tag}
            </div>

            <h2 className="text-xl font-medium text-gray-800 mt-6">{pkg.name}</h2>

          </div>


          <ul className="mt-7 mb-6 space-y-2  text-sm text-gray-700">
            {pkg.features.map((feature, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-yellow-500 mt-1"><MdArrowCircleDown /></span>
                <span className="font-regular text-start">{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-2">
            <div className="flex justify-end pb-[15px]">
              <Button className="text-[#3586FF]" onClick={handleDemoModalView}>
                View Demo Product
              </Button>
            </div>

            <Button className="w-full bg-white border md:text-[16px] text-[12px] border-gray-300 text-gray-700 font-medium py-2 rounded-md hover:bg-gray-100">
              Call Customer Support
            </Button>
            <Button
              onClick={handleView}
              className="w-full bg-[#3586FF] text-white md:text-[16px] text-[12px] font-medium py-2 rounded-md hover:bg-blue-400">
              Request More Info
            </Button>
          </div>
        </div>

      ))}
      {modal && (
        <Modal
          isOpen={modal}
          closeModal={() => setModal(false)}
          className="md:max-w-[800px] max-w-[370px] z-[1000]"
        >
          <div className="p-4">

            <div>
              <p className="text-[#7f8793] mb-2">
                Location:
              </p>
            </div>
            <p className="text-[#7f8793] mb-2">
              Experience Required:years
            </p>
            <p className="text-[#7f8793] mb-6">
              Job Type:
            </p>


            <p className="mt-6 text-[#3586FF] underline">
              To apply for this job, email your resume at{" "}
              <Link href="mailto:sales@onecasa.in">
                sales@onecasa.in
              </Link>
            </p>


          </div>
        </Modal>
      )}


      {demoModal && (
        <Modal
          isOpen={demoModal}
          closeModal={() => setDemoModal(false)}
          className="md:max-w-[800px] max-w-[370px] z-[1000]"
        >
          <div className="p-4">

            <div>
              <p className="text-[#7f8793] mb-2">
                Location:
              </p>
            </div>
            <p className="text-[#7f8793] mb-2">
              Experience Required:years
            </p>
            <p className="text-[#7f8793] mb-6">
              Job Type:
            </p>


            <p className="mt-6 text-[#3586FF] underline">
              To apply for this job, email your resume at{" "}
              <Link href="mailto:sales@onecasa.in">
                sales@onecasa.in
              </Link>
            </p>


          </div>
        </Modal>
      )}
    </div>
  );
};



export default PackageBroker;
