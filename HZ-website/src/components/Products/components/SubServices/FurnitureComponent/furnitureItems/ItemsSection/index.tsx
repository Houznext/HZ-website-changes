import { useEffect, useState } from "react";
import Item from "./item";
import Loader from "@/components/Loader";
import { shouldFetchItemsclick } from "@/utils/itemsclickGuard";
import ItemsFilterBar from "@/components/ItemsFilterBar";
import ListEndQuote from "@/components/ListEndQuote";
import Drawer from "@/common/Drawer";
import Button from "@/common/Button";
interface FurnitureImage {
  id: number;
  url: string;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
  colorHex: string | null;
  angle: string | null;
  viewType: string | null;
}

export interface IItemsSectionProps {
  items: {
    id: string;
    category: string;
    subCategory?: string;
    description?: string;
    highlights?: string;
    brand?: string;
    tags?: string[];
    name: string;
    isFeatured?: boolean;
    isCustomizable?: boolean;
    customizationDescription?: string;
    deliveryTime?: string;
    warranty?: string;
    assembly?: string;
    returnPolicy?: string;

    sellerId?: number;

    baseMrp?: number;
    power?: number;
    baseSellingPrice?: number;
    baseDiscountPercent?: number;
    ratingCount?: number;
    averageRating?: number;
    createdDate?: string;

    updatedDate?: Date;
    images: FurnitureImage[];
    otherProperties?: {
      [key: string]: string;
    };

  }[];
  category: string;
  isLoading: boolean;
}
export interface AnalyticsItem {
  itemId: any;
  itemName: string;
  category: string;
  price: number;
  eventName: string;
  discount: string;
  eventCount: number;
}

const ItemSection = ({ items, category, isLoading }: IItemsSectionProps) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsItem[]>([]);
  const [filteredItems, setFilteredItems] = useState(items);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (!shouldFetchItemsclick()) return;
    fetch("/api/itemsclick")
      .then((res) => res.json())
      .then((data) => setAnalyticsData(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => {});
  }, []);

  // Sync filteredItems when parent fetches new items (single source of truth - parent handles API calls)
  useEffect(() => {
    setFilteredItems(items);
  }, [items]);
  const getEventCount = (id: string) => {
    const dataArray = Array.isArray(analyticsData) ? analyticsData : [];
    const analyticsItem = dataArray.filter(
      (item) => String(item.itemId) === String(id)
    );
    const totalEventCount = analyticsItem.reduce(
      (acc, curr) => Number(acc) + Number(curr.eventCount),
      0
    );
    return totalEventCount;
  };


  return (
    <>
      <div className="pt-4 mb-6 md:pt-8 md:mb-10 md:flex md:items-start md:gap-6 pb-28 md:pb-0">
        <div className="hidden md:block w-full md:w-[260px] lg:w-[280px] md:flex-shrink-0">
          <ItemsFilterBar
            items={items as any}
            category={category}
            isLoading={isLoading}
            path="furnitures"
            onFilterChange={setFilteredItems}
          />
        </div>

        <div className="mt-3 md:mt-0 flex-1 min-w-0">
        {isLoading ? (
          <div className="w-full h-screen">
            <Loader />
          </div>
        ) : filteredItems.length === 0 ? (
          <p className="w-full h-auto flex justify-center items-center">
            No items found
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 w-full px-1 md:px-0">
              {filteredItems.map((item) => {
                const eventCount = getEventCount(item.id as any);
                return (
                  <Item
                    key={item.id}
                    category={category}
                    item={item as any}
                    eventCount={eventCount}
                  />
                );
              })}
            </div>
            <ListEndQuote path="furnitures" />
          </>
        )}
        </div>
      </div>

      {/* Mobile: SORT | FILTER bar (z-[100] above BottomNav z-50; layout no longer uses overflow-x-clip) */}
      <div className="fixed bottom-[58px] left-0 right-0 z-[100] md:hidden flex items-center justify-center gap-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <Button type="button" onClick={() => setTimeout(() => setMobileSortOpen(true), 0)} className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 min-h-[44px]">
          <span className="text-base opacity-80">↓↑</span> SORT
        </Button>
        <div className="w-px h-6 bg-gray-200" aria-hidden="true" />
        <Button type="button" onClick={() => setTimeout(() => setMobileFilterOpen(true), 0)} className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 min-h-[44px]">
          <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          FILTER
        </Button>
      </div>

      <Drawer open={mobileSortOpen} handleDrawerToggle={setMobileSortOpen} title="SORT BY" hideHeader={false} openVariant="right" closeOnOutsideClick panelCls="w-full max-w-[100%] sm:max-w-[340px]" panelInnerCls="overflow-hidden px-0 py-0 flex flex-col" closeIconCls="text-gray-700" overLayCls="bg-black/40" className="!z-[200]">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ItemsFilterBar items={items as any} category={category} isLoading={isLoading} path="furnitures" onFilterChange={setFilteredItems} variant="sortDrawer" onClose={() => setMobileSortOpen(false)} />
          </div>
          <div className="shrink-0 flex items-center gap-2 border-t border-gray-200 bg-white px-3 py-2">
            <button type="button" onClick={() => setMobileSortOpen(false)} className="flex-1 py-2.5 text-sm font-semibold text-gray-700 uppercase tracking-wide rounded border border-gray-300 bg-white">Close</button>
            <button type="button" onClick={() => setMobileSortOpen(false)} className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#3586FF] rounded uppercase tracking-wide">Apply</button>
          </div>
        </div>
      </Drawer>

      <Drawer
        open={mobileFilterOpen}
        handleDrawerToggle={setMobileFilterOpen}
        title="FILTERS"
        hideHeader={false}
        openVariant="right"
        closeOnOutsideClick
        panelCls="w-full max-w-[100%] sm:max-w-[360px]"
        panelInnerCls="overflow-hidden px-0 py-0 flex flex-col"
        closeIconCls="text-gray-700"
        overLayCls="bg-black/40"
        className="!z-[200]"
      >
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ItemsFilterBar items={items as any} category={category} isLoading={isLoading} path="furnitures" onFilterChange={setFilteredItems} variant="drawer" />
          </div>
          <div className="shrink-0 flex items-center gap-2 border-t border-gray-200 bg-white px-3 py-2">
            <button type="button" onClick={() => setMobileFilterOpen(false)} className="flex-1 py-2.5 text-sm font-semibold text-gray-700 uppercase tracking-wide rounded border border-gray-300 bg-white">Close</button>
            <button type="button" onClick={() => setMobileFilterOpen(false)} className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#3586FF] rounded uppercase tracking-wide">Apply</button>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default ItemSection;
