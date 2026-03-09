import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineCalendar, HiArrowRight, HiOutlineTrendingUp } from "react-icons/hi";

interface TrendingBlogData {
  id: number;
  title: string;
  previewDescription?: string;
  thumbnailImageUrl?: string;
  CoverImageUrl?: string;
  blogType?: string;
  blogStatus?: string;
  updatedAt: string;
}

const TrendingBlogCard = ({ data }: { data: TrendingBlogData }) => {
  const { id, title, previewDescription, thumbnailImageUrl, CoverImageUrl, blogType, blogStatus, updatedAt } = data;

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

  const imageUrl = CoverImageUrl || thumbnailImageUrl || "/images/TopProperties/property3.png";

  return (
    <Link href={`/blogs/${id}`} className="block">
      <div className="group w-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className="flex flex-col md:flex-row">
          {/* Image Container */}
          <div className="relative w-full md:w-48 h-40 md:h-auto md:min-h-[160px] overflow-hidden bg-gray-100">
            <Image
              src={imageUrl}
              alt={title || "Blog image"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            
            {/* Trending indicator */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full shadow-lg">
              <HiOutlineTrendingUp className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Trending</span>
            </div>
            
            {/* Category badge */}
            {blogType && (
              <div className="absolute bottom-3 left-3">
                <span className="px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 shadow-sm">
                  {blogType}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-5 flex flex-col justify-between">
            {/* Top section */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#3586FF] transition-colors duration-200 line-clamp-2 mb-2">
                {title}
              </h3>
              {previewDescription && (
                <p className="text-sm text-gray-500 line-clamp-2">
                  {previewDescription}
                </p>
              )}
            </div>

            {/* Bottom section */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              {/* Date */}
              <div className="flex items-center gap-1.5 text-gray-400">
                <HiOutlineCalendar className="w-4 h-4" />
                <span className="text-sm font-medium">{formattedDate}</span>
              </div>

              {/* Read more */}
              <div className="flex items-center gap-2 text-[#3586FF] font-semibold text-sm group-hover:gap-3 transition-all duration-200">
                <span>Read article</span>
                <div className="w-8 h-8 rounded-full bg-[#3586FF]/10 flex items-center justify-center group-hover:bg-[#3586FF] transition-colors duration-200">
                  <HiArrowRight className="w-4 h-4 group-hover:text-white transition-colors duration-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TrendingBlogCard;
