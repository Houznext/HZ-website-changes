import { GetStaticPaths, GetStaticProps } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SeoHead from "@/components/SeoHead";
import BlogDetails from "@/components/Products/components/BlogsDetails";
import { articleSchema } from "@/lib/schemas";

function plainTextFromHtml(html: string, maxLen: number): string {
  if (!html) return "";
  const t = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return t.length > maxLen ? `${t.slice(0, maxLen)}…` : t;
}

const BlogDetailPage = ({ blog, similarBlogs }: { blog: any; similarBlogs?: any[] }) => {
  if (!blog) {
    return (
      <>
        <SeoHead
          title="Article not found | Houznext"
          description="This blog post could not be found."
          canonical="/blog"
        />
        <Navbar />
        <main className="min-h-[50vh] flex items-center justify-center px-4" style={{ background: "#f5f7fa" }}>
          <p className="text-charcoal font-medium">This article could not be found.</p>
        </main>
        <Footer />
      </>
    );
  }

  const id = String(blog.id);
  const description =
    (blog.previewDescription as string)?.trim() ||
    plainTextFromHtml(blog.content || "", 180);
  const published = blog.createdAt || blog.updatedAt || new Date().toISOString();
  const modified = blog.updatedAt || published;

  return (
    <>
      <SeoHead
        title={blog.title}
        description={description}
        canonical={`/blogs/${id}`}
        ogType="article"
        ogImage={blog.CoverImageUrl || blog.thumbnailImageUrl}
        articleMeta={{
          publishedTime: published,
          modifiedTime: modified,
          author: "Houznext",
        }}
        schema={articleSchema({
          title: blog.title,
          description,
          slug: id,
          datePublished: published,
          dateModified: modified,
          imageUrl: blog.CoverImageUrl || blog.thumbnailImageUrl,
          urlPath: `blogs/${id}`,
        })}
      />
      <Navbar />
      <BlogDetails blog={blog} similarBlogs={similarBlogs ?? []} />
      <Footer />
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT;
    if (!apiUrl) {
      return { paths: [], fallback: "blocking" };
    }
    const res = await fetch(`${apiUrl}/blog?take=500`);
    if (!res.ok) return { paths: [], fallback: "blocking" };
    const data = await res.json();
    const blogs = Array.isArray(data) ? data : data?.blogs ?? [];
    const paths = blogs
      .filter((b: { id?: string | number }) => b?.id != null)
      .map((b: { id: string | number }) => ({
        params: { id: String(b.id) },
      }));
    return { paths, fallback: "blocking" };
  } catch {
    return { paths: [], fallback: "blocking" };
  }
};

export const getStaticProps: GetStaticProps = async (context) => {
  const id = context.params?.id;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT;
  if (!apiUrl) {
    return {
      props: { blog: null, similarBlogs: [] },
      revalidate: 600,
    };
  }
  try {
    const blogRes = await fetch(`${apiUrl}/blog/${id}`);
    if (!blogRes.ok) {
      return { notFound: true, revalidate: 60 };
    }
    const blog = await blogRes.json();

    let similarBlogs: any[] = [];
    if (blog?.blogType) {
      try {
        const listRes = await fetch(
          `${apiUrl}/blog?blogType=${encodeURIComponent(blog.blogType)}&take=8`
        );
        const listRaw = await listRes.json();
        const list = listRaw?.blogs ?? [];
        similarBlogs = list
          .filter((b: { id?: string | number }) => b?.id != null && String(b.id) !== String(id))
          .slice(0, 4);
      } catch {
        similarBlogs = [];
      }
    }

    return {
      props: {
        blog,
        similarBlogs,
      },
      revalidate: 600,
    };
  } catch (e) {
    console.error("Blog fetch failed", e);
    return {
      props: {
        blog: null,
        similarBlogs: [],
      },
      revalidate: 600,
    };
  }
};

export default BlogDetailPage;
