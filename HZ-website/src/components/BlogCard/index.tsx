import React, { useMemo } from "react";
import Image from "next/legacy/image";
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

const BlogCard = ({ data }: { data: BlogCardData }) => {
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
        return "bg-gradient-to-r from-rose-500 to-pink-500";
      case "Featured":
        return "bg-gradient-to-r from-amber-500 to-yellow-500";
      default:
        return "bg-[#3586FF]";
    }
  };

  if (!title || !previewDescription) return null;

  return (
   <Link href={`/blogs/${id}`} className="flex h-full w-full">
      <div className="group h-full bg-white rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl w-full   ">
        <div className="relative h-44 w-full overflow-hidden bg-gray-100">
          {thumbnailImageUrl ? (
            <Image
              src={thumbnailImageUrl}
              alt={title || "Blog image"}
              layout="fill"
              objectFit="cover"
              className="group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Status Badge */}
          {blogStatus && (
            <div className="absolute top-3 left-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg ${getStatusColor(blogStatus)}`}>
                {blogStatus}
              </span>
            </div>
          )}
          
          {/* Category Badge */}
          {blogType && (
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 shadow-sm">
                {blogType}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Title */}
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-[#3586FF] transition-colors duration-200 mb-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-500 line-clamp-3 flex-1 mb-4">
            {previewDescription}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            {/* Date */}
            <div className="flex items-center gap-1.5 text-gray-400">
              <HiOutlineCalendar className="w-4 h-4" />
              <span className="text-xs font-medium">{formattedDate}</span>
            </div>

            {/* Read More */}
            <div className="flex items-center gap-1.5 text-[#3586FF] font-medium text-sm group-hover:gap-2 transition-all duration-200">
              <span>Read</span>
              <HiArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
