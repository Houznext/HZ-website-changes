import { create } from "zustand";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";

interface HomePageStore {
  bannerData: any[];
  allBlogs: any[];
  newlyLaunchedProperties: any[];
  popularLocalities: any[];
  city: string;
  loading: boolean;

  fetchBannerData: () => Promise<void>;
  fetchBlogs: () => Promise<void>;
  fetchCityProjects: (city: string) => Promise<void>;
  setAllBlogs: (blogs: any[]) => void;
}

export const useHomepageStore = create<HomePageStore>((set, get) => ({
  bannerData: [],
  allBlogs: [],
  newlyLaunchedProperties: [],
  popularLocalities: [],
  city: "Hyderabad",
  loading: false,

  setAllBlogs: (blogs) => set({ allBlogs: blogs }),
  fetchBannerData: async () => {
    if (get().bannerData.length) return;
    set({ loading: true });
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.strapiInteriors}home-page-banners?populate=*`
      );
      set({ bannerData: response.body, loading: false });
    } catch (error) {
      console.error("error is ", error);
      set({ loading: false });
    }
  },
  fetchBlogs: async () => {
    if (get()?.allBlogs?.length) return;
    try {
      const response = await apiClient.get(`${apiClient.URLS.blogs}`);
      set({ allBlogs: response.body?.blogs || [] });
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Error fetching blogs");
    }
  },
  /** Property/unified city listing removed with main-product property UI. */
  fetchCityProjects: async (_city) => {
    set({
      newlyLaunchedProperties: [],
      popularLocalities: [],
      loading: false,
    });
  },
}));
