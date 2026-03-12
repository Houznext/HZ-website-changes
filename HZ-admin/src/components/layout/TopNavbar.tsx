import React, { useState } from "react";
import { Bell } from "lucide-react";
import apiClient from "@/src/utils/apiClient";
import SearchBar from "@/src/components/ui/SearchBar";
import { useRouter } from "next/router";

export default function TopNavbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?query=${encodeURIComponent(query.trim())}`);
  };

  const handleToggleNotifications = async () => {
    if (!isOpen && items.length === 0 && !isLoading) {
      try {
        setIsLoading(true);
        const res = await apiClient.get(apiClient.URLS.notifications, {});
        if (res.status === 200 && Array.isArray(res.body)) {
          setItems(res.body);
        }
      } catch (e) {
        console.error("Failed to load notifications", e);
      } finally {
        setIsLoading(false);
      }
    }
    setIsOpen((v) => !v);
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white shadow-sm relative">
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 text-sm text-slate-500">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search across Houznext admin..."
        />
      </form>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleToggleNotifications}
          className="relative rounded-full p-2 hover:bg-slate-100 transition"
        >
          <Bell className="w-5 h-5 text-slate-500" />
          {items.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#f2994a]" />
          )}
        </button>
        {isOpen && (
          <div className="absolute right-6 top-14 w-80 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-20">
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Notifications</span>
              {isLoading && (
                <span className="text-xs text-slate-400">Loading...</span>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 && !isLoading ? (
                <div className="px-4 py-6 text-sm text-slate-400 text-center">
                  No notifications yet.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {items.map((item: any) => (
                    <li key={item.id || item.createdAt} className="px-4 py-3 text-sm">
                      <p className="text-slate-800">
                        {item.title || item.message || "New activity"}
                      </p>
                      {item.createdAt && (
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

