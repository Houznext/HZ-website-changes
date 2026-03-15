import { GetStaticPaths, GetStaticProps } from "next";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import apiClient from "@/utils/apiClient";
import BlogDetails from "@/components/Products/components/BlogsDetails";

const BlogDetailPage = ({ blog, similarBlogs }: { blog: any; similarBlogs?: any[] }) => {
  if (!blog) {
    return <p className="text-center text-red-500">Blog not found.</p>;
  }

  return <BlogDetails blog={blog} similarBlogs={similarBlogs ?? []} />;
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT;
    if (!apiUrl) {
      return { paths: [], fallback: "blocking" };
    }
    const res = await fetch(`${apiUrl}/blog`);
    if (!res.ok) return { paths: [], fallback: "blocking" };
    const data = await res.json();
    const blogs = Array.isArray(data) ? data : (data?.blogs ?? []);
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
    const blogRaw = await blogRes.json();
    const blog = blogRaw?.body ?? blogRaw ?? null;

    let similarBlogs: any[] = [];
    if (blog?.blogType) {
      try {
        const listRes = await fetch(
          `${apiUrl}/blog?blogType=${encodeURIComponent(blog.blogType)}&take=5`
        );
        const listRaw = await listRes.json();
        const list = Array.isArray(listRaw?.blogs) ? listRaw.blogs : listRaw?.body?.blogs ?? [];
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

export default withGeneralLayout(BlogDetailPage);
