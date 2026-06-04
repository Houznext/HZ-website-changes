import React, { useMemo } from "react";
import Link from "next/link";
import { blogPostPath } from "@/lib/blogPaths";
import BlogRemoteImage from "@/components/BlogRemoteImage";
import { HiOutlineCalendar, HiArrowRight } from "react-icons/hi";

interface BlogCardData {
  id: number;
  slug?: string | null;
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
        return "bg-[#2f80ed]";
    }
  };

  if (!title || !previewDescription) return null;

  return (
   <Link href={blogPostPath({ id, slug: data.slug })} className="flex h-full w-full">
      <div
        className="group h-full bg-white rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg w-full"
        style={{ borderColor: "#dde8f5" }}
      >
        <div className="relative h-44 w-full overflow-hidden bg-[#f5f7fa]">
          {thumbnailImageUrl ? (
            <BlogRemoteImage
              src={thumbnailImageUrl}
              alt={title || "Blog image"}
              className="group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a3a5c] to-[#0f2a44]">
              <span className="text-white/40 text-sm">No image</span>
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
          <h3 className="text-base font-head font-bold text-charcoal line-clamp-2 group-hover:text-[#2f80ed] transition-colors duration-200 mb-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm line-clamp-3 flex-1 mb-4" style={{ color: "#5a6a7e" }}>
            {previewDescription}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "#dde8f5" }}>
            {/* Date */}
            <div className="flex items-center gap-1.5" style={{ color: "#94a3b8" }}>
              <HiOutlineCalendar className="w-4 h-4" />
              <span className="text-xs font-medium">{formattedDate}</span>
            </div>

            {/* Read More */}
            <div className="flex items-center gap-1.5 text-[#2f80ed] font-head font-bold text-sm group-hover:gap-2 transition-all duration-200">
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
