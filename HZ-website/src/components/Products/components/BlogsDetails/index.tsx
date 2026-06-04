import React, { useMemo } from "react";
import Link from "next/link";
import BlogRemoteImage from "@/components/BlogRemoteImage";
import { blogPostPath } from "@/lib/blogPaths";

function estimateReadMin(content: string, preview: string): string {
  const len = (content?.length || 0) + (preview?.length || 0);
  const mins = Math.max(3, Math.min(25, Math.ceil(len / 1200)));
  return `${mins} min`;
}

function formatBlogDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const BlogsDetails = ({ blog, similarBlogs = [] }: { blog: any; similarBlogs?: any[] }) => {
  const dateLine = useMemo(
    () => formatBlogDate(blog?.updatedAt || blog?.createdAt),
    [blog]
  );

  const readTime = useMemo(
    () => estimateReadMin(blog?.content || "", blog?.previewDescription || ""),
    [blog]
  );

  const cover = blog?.CoverImageUrl || blog?.thumbnailImageUrl || "";

  return (
    <main style={{ background: "#f5f7fa" }}>
      <section className="py-12 px-4 md:py-14" style={{ background: "#0f2a44" }}>
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[13px] font-[500] mb-6 transition-colors no-underline"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            <span aria-hidden>←</span> Back to blog
          </Link>
          {(blog?.blogType || blog?.blogStatus) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {blog?.blogType && (
                <span
                  className="text-[11px] font-head font-bold px-3 py-1 rounded-full"
                  style={{ background: "rgba(47,128,237,0.25)", color: "#2f80ed" }}
                >
                  {blog.blogType}
                </span>
              )}
              {blog?.blogStatus && (
                <span
                  className="text-[11px] font-head font-bold px-3 py-1 rounded-full text-white/90"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                >
                  {blog.blogStatus}
                </span>
              )}
            </div>
          )}
          <h1 className="font-head font-black text-[28px] md:text-[40px] leading-[1.15] text-white mb-4">
            {blog?.title || ""}
          </h1>
          <div
            className="flex flex-wrap items-center gap-2 text-[12px]"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            {dateLine && <span>{dateLine}</span>}
            {dateLine && <span>·</span>}
            <span>{readTime} read</span>
            <span>·</span>
            <span>By Houznext</span>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-10 md:py-12">
        <article
          className="bg-white rounded-2xl border overflow-hidden shadow-sm"
          style={{ borderColor: "#dde8f5" }}
        >
          {cover ? (
            <div className="relative w-full aspect-[21/9] max-h-[280px] bg-[#0f2a44]">
              <BlogRemoteImage
                src={cover}
                alt={blog?.title ? String(blog.title) : ''}
                priority
              />
            </div>
          ) : null}
          <div className="p-6 md:p-8">
            {blog?.previewDescription ? (
              <p className="text-[15px] leading-relaxed font-[500] text-charcoal mb-6">
                {blog.previewDescription}
              </p>
            ) : null}
            <div
              className="prose prose-sm max-w-none text-[14px] leading-relaxed"
              style={{ color: "#1f2933" }}
              dangerouslySetInnerHTML={{ __html: blog?.content ?? "" }}
            />
          </div>
        </article>

        <div
          className="mt-8 p-6 md:p-8 rounded-2xl text-center"
          style={{ background: "#0f2a44" }}
        >
          <h3 className="font-head font-bold text-white text-[18px] mb-2">
            Ready to start your project?
          </h3>
          <p className="text-[13px] mb-5" style={{ color: "rgba(255,255,255,0.65)" }}>
            Get a free personalised estimate from our design team
          </p>
          <a
            href="https://wa.me/919759750770?text=Hi%20Houznext%2C%20I%20read%20your%20blog%20and%20want%20a%20free%20estimate"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-head font-bold text-white text-[13px] no-underline"
            style={{ background: "#2f80ed" }}
          >
            Get free estimate →
          </a>
        </div>
      </div>

      {similarBlogs.length > 0 && (
        <section className="border-t border-[#dde8f5] bg-white py-10 md:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-head font-bold text-[20px] md:text-[22px] text-charcoal mb-6">
              More in {blog?.blogType ?? "this category"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similarBlogs.map((b: any) => {
                const img = b.thumbnailImageUrl || b.CoverImageUrl;
                return (
                  <Link
                    key={b.id}
                    href={blogPostPath(b)}
                    className="group bg-white rounded-2xl border overflow-hidden transition-shadow hover:shadow-lg no-underline"
                    style={{ borderColor: "#dde8f5" }}
                  >
                    <div
                      className="relative h-36 w-full"
                      style={{ background: "linear-gradient(135deg, #1a3a5c, #0f2a44)" }}
                    >
                      {img ? (
                        <BlogRemoteImage src={img} alt={b.title ? String(b.title) : ''} />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f2a44]/85 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <span
                          className="text-[10px] font-head font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ background: "rgba(47,128,237,0.75)" }}
                        >
                          {b.blogType || "Article"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-head font-bold text-[14px] text-charcoal line-clamp-2 group-hover:text-[#2f80ed] transition-colors">
                        {b.title}
                      </h3>
                      <p className="text-[12px] mt-2 line-clamp-2" style={{ color: "#5a6a7e" }}>
                        {b.previewDescription}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 font-head font-bold text-[13px] text-[#2f80ed] hover:underline"
              >
                View all articles
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default BlogsDetails;
