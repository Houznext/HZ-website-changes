import { create } from "zustand";
import apiClient from "@/utils/apiClient";
import {
  capitalizeFirstLetter,
  formatBHKTypes,
  formatCost,
  generateSlug,
} from "@/utils/helpers";
import toast from "react-hot-toast";

type ProjectType = {
  minPrice: number;
  maxPrice: number;
  MinSize: { size: number; unit: string };
  MaxSize: { size: number; unit: string };
  location: {
    locality: string;
    subLocality: string;
  };
};

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
  fetchCityProjects: async (city) => {
    set({ loading: true });
    try {
      const response = await apiClient.get(
        `${
          apiClient.URLS.property
        }/get-city-projects?city=${capitalizeFirstLetter(city)}`
      );

      const projects = response.body;

      const formattedProjects = projects.map((project: any, index: number) => {
        const imageUrls = [
          "/images/newlylaunched/apartment2.png",
          "/images/newlylaunched/apartments3.png",
          "/images/newlylaunched/apartment5.png",
          "/images/newlylaunched/apartment6.png",
        ];
        const name = project.Name;
        const id = project.id;
        const location = `${project.location.locality}, ${project.location.city}`;
        const city = `${project.location.city}`;
        const cost = `${formatCost(project.minPrice)} - ${formatCost(
          project.maxPrice
        )} *`;
        const type = project.propertyType.typeName;
        const rooms = formatBHKTypes(project.bhkTypes);
        const slug = generateSlug(name);

        return {
          imageUrl: imageUrls[index % 4],
          name,
          id,
          location,
          city,
          cost,
          type,
          rooms: new Set(rooms),
          cta: {
            label: "View Details",
            href: `/properties/buy/${city}/details/${slug}?id=${id}&type=project`,
          },
        };
      });
      const localityMap = new Map();
      projects.forEach((project: ProjectType) => {
        const key = `${project.location.locality}||${project.location.subLocality}`;
        if (!localityMap.has(key)) {
          localityMap.set(key, {
            minPrice: project.minPrice,
            maxPrice: project.maxPrice,
            minSize: project.MinSize.size,
            maxSize: project.MaxSize.size,
            projectCount: 0,
          });
        }

        const data = localityMap.get(key)!;
        data.minPrice = Math.min(data.minPrice, project.minPrice);
        data.maxPrice = Math.max(data.maxPrice, project.maxPrice);
        data.minSize = Math.min(data.minSize, project.MinSize.size);
        data.maxSize = Math.max(data.maxSize, project.MaxSize.size);
        data.projectCount += 1;
      });

      const formattedLocalities = Array.from(localityMap.entries()).map(
        ([key, data]) => {
          const [locality, subLocality] = key.split("||");
          return {
            localty: locality,
            location: subLocality,
            range: `${Math.floor(data.minPrice / 100000)}L - ${Math.floor(
              data.maxPrice / 100000
            )}L*`,
            sqft: `${data.minSize} - ${data.maxSize} SQ.FT`,
            projectCount: data.projectCount,
          };
        }
      );

      set({
        newlyLaunchedProperties: formattedProjects,
        popularLocalities: formattedLocalities,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching city projects:", error);
      set({ loading: false });
    }
  },
}));
