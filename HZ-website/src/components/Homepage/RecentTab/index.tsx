import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Home, Package, Eye, TrendingUp, Activity } from "lucide-react";
import Button from "@/common/Button";
import { useSession } from "next-auth/react";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { useRouter } from "next/router";
import { MdVerified } from "react-icons/md";

interface ViewedProperty {
  id: number;
  name: string;
}

interface ViewedItem {
  id: number;
  name: string;
}

const RecentTab = () => {
  const [user, setUser] = useState<any>();
  const session = useSession();
  const [viewedProperties, setViewedProperties] = useState<ViewedProperty[]>([]);
  const [viewedItems, setViewedItems] = useState<ViewedItem[]>([]);

  const loadViewedProperties = () => {
    const storedData = localStorage.getItem("viewed_properties");
    const storedProperties: ViewedProperty[] = storedData
      ? JSON.parse(storedData)
      : [];
    setViewedProperties(storedProperties);
  };

  const loadViewedItems = () => {
    const storedData = localStorage.getItem("viewed_Items");
    const storedItems: ViewedItem[] = storedData ? JSON.parse(storedData) : [];
    setViewedItems(storedItems);
  };

  useEffect(() => {
    loadViewedProperties();
    loadViewedItems();
  }, []);

  useEffect(() => {
    if (session.status === "authenticated") {
      setUser(session?.data?.user);
    }
  }, [session?.status]);

  const router = useRouter();

  const activityStats = [
    {
      label: "Properties",
      count: viewedProperties.length,
      icon: <Home className="w-5 h-5" />,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      accentColor: "bg-blue-500",
      items: viewedProperties,
      itemIcon: <Home className="w-4 h-4" />
    },
    {
      label: "Items",
      count: viewedItems.length,
      icon: <Package className="w-5 h-5" />,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      accentColor: "bg-green-500",
      items: viewedItems,
      itemIcon: <Package className="w-4 h-4" />
    }
  ];

  return (
    <div className="space-y-4 max-h-[360px] overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="relative">
          {user?.profile ? (
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-100">
              <img
                src={user.profile}
                alt={user.firstName || "User"}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3586FF] to-[#3277df] flex items-center justify-center shadow-md">
              <FaUserCircle className="text-white text-2xl" />
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-white"></div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-gray-900 text-sm truncate">
              {user?.firstName || "Guest"} {user?.lastName}
            </h3>
            {user?.email && <MdVerified className="text-blue-500 flex-shrink-0" size={14} />}
          </div>
          <p className="text-xs text-gray-500 truncate">{user?.email || "guest@example.com"}</p>
        </div>
      </div>

      {/* Activity Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
            <Activity className="w-4 h-4 text-[#3586FF]" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Recent Activity</h3>
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Last 7 days
        </span>
      </div>

      {/* Activity Stats Cards */}
      <div className="space-y-3">
        {activityStats.map((stat, index) => (
          <div key={index} className="space-y-2">
            {/* Stat Header Card */}
            <div
              className={`${stat.bgColor} rounded-xl p-3 cursor-pointer hover:shadow-md transition-all duration-300 group border border-gray-100`}
              onClick={() => router.push("/recentproperties")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.iconColor} bg-white/80 shadow-sm group-hover:scale-110 transition-transform`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.count}
                    </p>
                    <p className="text-xs text-gray-600 font-medium">
                      {stat.label} Viewed
                    </p>
                  </div>
                </div>
                <FiArrowUpRight className={`${stat.iconColor} w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform`} />
              </div>
            </div>

            {/* Recent Items List */}
            {stat.count > 0 && (
              <div className="space-y-1.5">
                {stat.items.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-all duration-200 cursor-pointer group"
                    onClick={() => router.push("/recentproperties")}
                  >
                    <div className={`p-1.5 rounded-md ${stat.bgColor} ${stat.iconColor} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      {stat.itemIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800 font-medium truncate group-hover:text-[#3586FF] transition-colors">
                        {item.name}
                      </p>
                    </div>
                    <Eye className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  </div>
                ))}

                {/* Show more indicator */}
                {stat.count > 3 && (
                  <button
                    onClick={() => router.push("/recentproperties")}
                    className="w-full text-xs text-[#3586FF] hover:text-[#4287ef] font-medium py-2 text-center hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    +{stat.count - 3} more {stat.label.toLowerCase()}
                  </button>
                )}
              </div>
            )}

            {/* Empty State */}
            {stat.count === 0 && (
              <div className="text-center py-4 px-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <div className={`inline-flex p-2 rounded-lg ${stat.bgColor} ${stat.iconColor} mb-2`}>
                  {stat.icon}
                </div>
                <p className="text-xs text-gray-500">
                  No {stat.label.toLowerCase()} viewed yet
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total Activity Summary */}
      {(viewedProperties.length > 0 || viewedItems.length > 0) && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Total Activity</span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">
              {viewedProperties.length + viewedItems.length}
            </span>
            <span className="text-xs text-gray-500">views this week</span>
          </div>
        </div>
      )}

      {/* View Full Activity Button */}
      <Button
        className="w-full py-2.5 bg-gradient-to-r from-[#3586FF] to-[#4287ef] rounded-xl text-white text-sm font-semibold hover:from-[#4287ef] hover:to-[#3277df] transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group"
        onClick={() => router.push("/recentproperties")}
      >
        View Full Activity
        <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
};

export default RecentTab;