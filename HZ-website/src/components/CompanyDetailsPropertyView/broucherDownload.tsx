import Image from "next/image";
import Link from "next/link";
import { FaDownload, FaFilePdf } from "react-icons/fa";
import { FiFileText } from "react-icons/fi";

function isImage(url: string) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
}
export default function ProjectBrochure({ brochures }: any) {
  return (
    <div className=" bg-white rounded-md ">
      <h2 className="md:text-[16px] text-[14px] font-bold text-[#3586FF] md:mb-4 mb-2 flex items-center gap-2">
        {" "}
        <FiFileText className=" text-[#3586FF]" /> Project Brochure
      </h2>

      <div className="flex space-x-4 overflow-x-auto">
        {brochures?.length > 0 &&
          brochures.map((url: string, index: number) => (
            <div
              key={index}
              className="relative w-72 h-48 overflow-hidden rounded-md shadow-md group bg-gray-100 flex items-center justify-center"
            >
              {isImage(url) ? (
                <Image
                  src={url}
                  alt={`Brochure ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <FaFilePdf className="text-red-600 text-5xl" />
                  <p className="mt-2 text-sm text-gray-700">PDF Brochure</p>
                </div>
              )}

              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                <Link
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-[12px] md:text-[14px] text-black font-medium px-4 py-2 rounded"
                >
                  View Brochure
                </Link>
              </div>
            </div>
          ))}
      </div>

      <div className="md:mt-6">
        <Link
          href={brochures?.[0]}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-[12px] md:text-[14px] px-4 py-2 border border-[#3586FF] text-[#3586FF] font-medium rounded hover:bg-purple-50 transition"
        >
          <FaDownload className="mr-2" />
          Download Brochure
        </Link>
      </div>
    </div>
  );
}
