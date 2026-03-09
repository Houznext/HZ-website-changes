import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import BlogCard from "../BlogCard";
import TrendingBlogCard from "../TrendingBlogCard";
import MobileBlogCard from "../MobileBlogCard";
import Loader from "@/components/Loader";
import { BlogPageProps } from "@/pages/blogs";
import { useRouter } from "next/router";
import GoogleAdSense from "@/components/GoogleAdSense";
import BlogFilters from "../BlogFilters";
import apiClient from "@/utils/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineDocumentText, HiOutlineSparkles, HiOutlineTrendingUp } from "react-icons/hi";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface BlogData {
  id: number;
  title: string;
  previewDescription: string;
  thumbnailImageUrl: string;
  CoverImageUrl: string;
  blogType: string;
  blogStatus: string;
  content: string;
  updatedAt: string;
  createdAt: string;
}

const BlogsHero = ({
  blogType: initialBlogType,
  initialTrendingBlogs,
  initialFeaturedBlogs,
  initialRegularBlogs,
}: BlogPageProps) => {
  const router = useRouter();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    initialBlogType ? [initialBlogType] : []
  );
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");
  
  // Blog data states
  const [blogs, setBlogs] = useState<BlogData[]>([
    ...initialTrendingBlogs,
    ...initialFeaturedBlogs,
    ...initialRegularBlogs,
  ]);
  const [totalResults, setTotalResults] = useState(
    initialTrendingBlogs.length + initialFeaturedBlogs.length + initialRegularBlogs.length
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search term (300ms delay)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch blogs from API
  const fetchBlogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        sortBy,
        sortOrder,
      };

      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      if (selectedTypes.length > 0) {
        params.blogType = selectedTypes;
      }

      if (selectedStatus) {
        params.blogStatus = selectedStatus;
      }

      const res = await apiClient.get(apiClient.URLS.blogs, params);
      
      // Handle both old format (array) and new format (object with blogs array)
      const blogData = Array.isArray(res.body) ? res.body : (res.body?.blogs || []);
      const total = Array.isArray(res.body) ? blogData.length : (res.body?.total || blogData.length);
      
      setBlogs(blogData);
      setTotalResults(total);
      setHasSearched(true);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      setBlogs([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, selectedTypes, selectedStatus, sortBy, sortOrder]);

  // Fetch blogs when filters change (except on initial load)
  useEffect(() => {
    // Skip initial fetch if we have initial data and no active filters
    if (!hasSearched && !debouncedSearchTerm && selectedTypes.length <= 1 && !selectedStatus) {
      return;
    }
    fetchBlogs();
  }, [debouncedSearchTerm, selectedTypes, selectedStatus, sortBy, sortOrder]);

  // Update URL when type changes
  useEffect(() => {
    const currentType = router.query.blogType as string;
    const newType = selectedTypes.length === 1 ? selectedTypes[0] : "";
    
    if (currentType !== newType) {
      const query = newType ? { blogType: newType } : {};
      router.replace({ pathname: "/blogs", query }, undefined, { shallow: true });
    }
  }, [selectedTypes]);

  // Sort handler
  const handleSortChange = useCallback((newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);

  // Categorize blogs by status
  const { trendingBlogs, featuredBlogs, regularBlogs } = useMemo(() => {
    // If filtering by status, don't categorize - show all in one section
    if (selectedStatus) {
      return {
        trendingBlogs: selectedStatus === "Trending" ? blogs : [],
        featuredBlogs: selectedStatus === "Featured" ? blogs : [],
        regularBlogs: selectedStatus === "Regular" ? blogs : (selectedStatus === "" ? [] : blogs),
      };
    }

    // Otherwise, categorize by status
    return {
      trendingBlogs: blogs.filter((b) => b.blogStatus === "Trending"),
      featuredBlogs: blogs.filter((b) => b.blogStatus === "Featured"),
      regularBlogs: blogs.filter((b) => b.blogStatus === "Regular"),
    };
  }, [blogs, selectedStatus]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const,
      },
    },
  };

  // Section renderer with animation
  const renderBlogSection = (
    title: string,
    blogs: BlogData[],
    icon: React.ReactNode,
    variant: "featured" | "trending" | "regular"
  ) => {
    if (blogs.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-xl ${
            variant === "featured" 
              ? "bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-600"
              : variant === "trending"
              ? "bg-gradient-to-br from-rose-100 to-pink-100 text-rose-600"
              : "bg-[#3586FF]/10 text-[#3586FF]"
          }`}>
            {icon}
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{blogs.length} {blogs.length === 1 ? 'article' : 'articles'}</p>
          </div>
        </div>

        {variant === "trending" ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {blogs.map((blog, index) => (
              <motion.div key={blog.id || index} variants={itemVariants}>
                <div className="hidden md:block">
                  <TrendingBlogCard data={blog} />
                </div>
                <div className="md:hidden">
                  <MobileBlogCard data={blog} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {blogs.map((blog, index) => (
              <motion.div
                key={blog.id || index}
                variants={itemVariants}
                className="h-full"
              >
                <div className="hidden md:block h-full rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden bg-white">
                  <BlogCard data={blog} />
                </div>
                <div className="md:hidden rounded-xl shadow-lg overflow-hidden bg-white">
                  <MobileBlogCard data={blog} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] backdrop-blur-sm bg-white/60 flex justify-center items-center"
          >
            <div className="bg-white max-w-full w-full  p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3">
              <Loader tagline="Loading blogs..." />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full min-h-screen bg-gray-50">
        <div 
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(to bottom right, #5CA0FF, #3586FF, #2A6FD6)" }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#3586FF]/30 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#3586FF]/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-3 md:px-8 py-8 md:pb-20 ">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <span className="inline-block px-3 md:px-4 py-1 label-text bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-xs md:text-sm font-medium mb-3 md:mb-4">
                Explore Our Knowledge Hub
              </span>
              <h1 className="mainheading-text font-bold text-white mb-2 tracking-tight">
                Blogs & Insights
              </h1>
              <p className="label-text font-medium text-white/80 max-w-2xl mx-auto leading-relaxed px-2">
                Stay informed with industry trends, expert tips, and strategies for successful channel partnering in real estate.
              </p>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 md:px-8 -mt-6 md:-mt-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <BlogFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedTypes={selectedTypes}
              onTypeChange={setSelectedTypes}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              totalResults={totalResults}
              isLoading={isLoading}
            />
          </motion.div>

          <div className="mt-10">
            {!isLoading && blogs.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <HiOutlineDocumentText className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No blogs found</h3>
                <p className="text-gray-600 label-text max-w-md mx-auto">
                  Try adjusting your filters or search term to find what you're looking for.
                </p>
              </motion.div>
            )}

            {renderBlogSection(
              "Featured Articles",
              featuredBlogs,
              <HiOutlineSparkles className="w-6 h-6" />,
              "featured"
            )}

            {renderBlogSection(
              "Trending Now",
              trendingBlogs,
              <HiOutlineTrendingUp className="w-6 h-6" />,
              "trending"
            )}

            {renderBlogSection(
              "All Articles",
              regularBlogs,
              <HiOutlineDocumentText className="w-6 h-6" />,
              "regular"
            )}

            {selectedStatus && blogs.length > 0 && !["Featured", "Trending", "Regular"].includes(selectedStatus) && (
              renderBlogSection(
                `${selectedStatus} Articles`,
                blogs,
                <HiOutlineDocumentText className="w-6 h-6" />,
                "regular"
              )
            )}
          </div>

          {/* Google AdSense */}
          <div className="py-12 max-w-full mx-auto flex flex-col items-center gap-4">
            <GoogleAdSense />
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogsHero;
