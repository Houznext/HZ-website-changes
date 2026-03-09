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
    const res = await apiClient.get(apiClient.URLS.blogs, {});
    const raw = res?.body;
    const blogs = Array.isArray(raw?.blogs)
      ? raw?.blogs
      : Array.isArray((raw as any)?.blogs)
        ? (raw as any).blogs
        : [];

    const paths = blogs
      .filter((blog: any) => blog?.id != null)
      .map((blog: any) => ({
        params: { id: String(blog.id) },
      }));

    return {
      paths,
      fallback: "blocking",
    };
  } catch (e) {
    console.error("Error generating paths", e);
    return { paths: [], fallback: "blocking" };
  }
};

export const getStaticProps: GetStaticProps = async (context) => {
  const id = context.params?.id;
  try {
    const res = await apiClient.get(`${apiClient.URLS.blogs}/${id}`, {});
    const blog = res.body || null;

    let similarBlogs: any[] = [];
    if (blog?.blogType) {
      try {
        const listRes = await apiClient.get(apiClient.URLS.blogs, {
          blogType: blog.blogType,
          take: 5,
        });
        const list = Array.isArray((listRes?.body as any)?.blogs)
          ? (listRes.body as any).blogs
          : [];
        similarBlogs = list
          .filter((b: any) => b?.id != null && String(b.id) !== String(id))
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
