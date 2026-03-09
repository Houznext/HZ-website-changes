import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { AiOutlineCalendar } from "react-icons/ai";
import { HiArrowLeft } from "react-icons/hi";
import BlogCard from "@/components/BlogCard";

const BlogDetails = ({ blog, similarBlogs = [] }: { blog: any; similarBlogs?: any[] }) => {
  const router = useRouter();

  const updateAt = useMemo(() => {
    if (blog?.updatedAt) {
      return new Date(blog.updatedAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
    return "";
  }, [blog]);

  const similarForCards = useMemo(() => {
    return similarBlogs.map((b: any) => ({
      id: b.id,
      title: b.title ?? "",
      previewDescription: b.previewDescription ?? b.title ?? "",
      thumbnailImageUrl: b.thumbnailImageUrl ?? b.CoverImageUrl ?? "",
      blogType: b.blogType,
      blogStatus: b.blogStatus,
      updatedAt: b.updatedAt ?? b.createdAt ?? "",
    }));
  }, [similarBlogs]);

  return (
    <div className="min-h-screen bg-gray-50/60">
      <article className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Back + breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 font-medium text-gray-700 hover:text-[#3586FF] transition-colors"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back to blogs
          </button>
          {blog?.blogType && (
            <>
              <span className="text-gray-300">/</span>
              <span className="text-[#3586FF] font-medium">{blog.blogType}</span>
            </>
          )}
        </div>

        {/* Cover image – reduced height */}
        <div className="relative w-full aspect-[21/9] max-h-[260px] md:max-h-[300px] rounded-xl overflow-hidden bg-gray-200 shadow-md mb-6">
          <Image
            src={blog?.CoverImageUrl || "/images/blogs/blog1.jpg"}
            alt={blog?.title || "Blog cover"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
            {blog?.blogType && (
              <span className="px-2.5 py-1 rounded-lg bg-[#3586FF] text-white text-xs font-medium shadow">
                {blog.blogType}
              </span>
            )}
            {blog?.blogStatus && (
              <span className="px-2.5 py-1 rounded-lg bg-white/95 text-gray-700 text-xs font-medium shadow">
                {blog.blogStatus}
              </span>
            )}
          </div>
        </div>

        {/* Title + date */}
        <header className="mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 leading-tight mb-3">
            {blog?.title || ""}
          </h1>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <AiOutlineCalendar className="w-4 h-4 shrink-0" />
            <time dateTime={blog?.updatedAt}>{updateAt}</time>
          </div>
        </header>

        {/* Content */}
        <div
          className="rich-text-container prose prose-gray max-w-none text-gray-700 text-[15px] leading-relaxed
            prose-headings:font-semibold prose-headings:text-gray-900
            prose-a:text-[#3586FF] prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-lg prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: blog?.content ?? "" }}
        />
      </article>

      {/* Similar blogs */}
      {similarForCards.length > 0 && (
        <section className="border-t border-gray-200 bg-white mt-10 py-8 md:py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-5">
              Similar in {blog?.blogType ?? "this category"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {similarForCards.map((item) => (
                <BlogCard key={item.id} data={item} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 text-[#3586FF] font-medium text-sm hover:underline"
              >
                View all blogs
                <HiArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogDetails;
