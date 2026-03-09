import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineCalendar, HiArrowRight } from "react-icons/hi";

interface BlogCardData {
  id: number;
  title: string;
  previewDescription: string;
  thumbnailImageUrl: string;
  blogType?: string;
  blogStatus?: string;
  updatedAt: string;
}

export default function MobileBlogCard({ data }: { data: BlogCardData }) {
  const { id, title, previewDescription, thumbnailImageUrl, blogType, blogStatus, updatedAt } = data;
  
  const formattedDate = useMemo(() => {
    if (updatedAt) {
      const date = new Date(updatedAt);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
    return "";
  }, [updatedAt]);

  // Status badge colors
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "Trending":
        return "bg-gradient-to-r from-rose-500 to-pink-500 text-white";
      case "Featured":
        return "bg-gradient-to-r from-amber-500 to-yellow-500 text-white";
      default:
        return "bg-[#3586FF] text-white";
    }
  };

  return (
    <Link href={`/blogs/${id}`} className="block w-full">
      <div className="w-full bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
        <div className="flex gap-3 p-3 w-full">
          {/* Image Container */}
          <div className="relative w-24 h-24 min-w-[96px] rounded-lg overflow-hidden bg-gray-100">
            {thumbnailImageUrl ? (
              <Image
                src={thumbnailImageUrl}
                alt={title || "Blog image"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <span className="text-gray-400 text-xs">No image</span>
              </div>
            )}
            
            {/* Status Badge */}
            {blogStatus && (
              <div className="absolute top-1.5 left-1.5">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${getStatusColor(blogStatus)}`}>
                  {blogStatus}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            {/* Title */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-[#3586FF] transition-colors duration-200">
                {title}
              </h3>
              {previewDescription && (
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                  {previewDescription}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-2">
              {/* Category & Date */}
              <div className="flex items-center gap-2">
                {blogType && (
                  <span className="text-[10px] font-medium text-[#3586FF] bg-[#3586FF]/10 px-2 py-0.5 rounded-md truncate max-w-[80px]">
                    {blogType}
                  </span>
                )}
                {formattedDate && (
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <HiOutlineCalendar className="w-3 h-3" />
                    {formattedDate}
                  </span>
                )}
              </div>

              {/* Arrow */}
              <div className="w-6 h-6 rounded-full bg-[#3586FF]/10 flex items-center justify-center group-hover:bg-[#3586FF] transition-colors duration-200">
                <HiArrowRight className="w-3.5 h-3.5 text-[#3586FF] group-hover:text-white -rotate-45 transition-colors duration-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
