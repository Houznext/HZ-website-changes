import React, { useEffect, useState, useMemo } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import Button from "@/src/common/Button";
import { Line, Doughnut, Pie, Bar } from "react-chartjs-2";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  RadialLinearScale,
  Filler,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  TrendingUp,
  Users,
  Eye,
  Activity,
  Globe,
  Smartphone,
  Clock,
  MousePointer,
  BarChart3,
  MapPin,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw,
  Database,
} from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  RadialLinearScale,
  Filler,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

interface AnalyticsItem {
  pageTitle: string;
  pagePath: string;
  pageViews: string;
  country?: string;
  deviceCategory?: string;
  userType?: string;
  browser?: string;
  city?: string;
  eventname?: string;
  sessions?: string;
  userEngagementDuration?: string;
  eventCount?: string;
  activeuser: string;
  sessionsource: string;
  Date: string;
}

interface Cartdata {
  itemId: number;
  itemName: string;
  category: string;
  eventCount: number;
}

interface Analysis {
  country: string;
  city: string;
  sessions: number;
  activeUsers: number;
  pageViews: number;
  bounceRate: number;
  date: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  subtitle?: string;
  gradient?: string;
}

function CustomTabPanel(props: any) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      className="w-full"
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  gradient = "from-blue-500 to-blue-600",
}) => {
  return (
    <div className="relative overflow-hidden bg-white rounded-[6px] border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className="md:p-4 p-3">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              {title}
            </p>
            <h3 className="text-3xl font-bold text-gray-900">
              {value}
            </h3>
            {subtitle && (
              <p className="text-xs font-regular text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            <div className="text-white">{icon}</div>
          </div>
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-2">
            {trend >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500" />
            )}
            <span
              className={`text-sm font-medium ${trend >= 0 ? "text-green-600" : "text-red-600"
                }`}
            >
              {Math.abs(trend)}% vs last period
            </span>
          </div>
        )}
      </div>
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />
    </div>
  );
};

export default function AdminDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsItem[]>([]);
  const [totalCount, setTotalcount] = useState<number>(0);
  const [activeusers, setactiveusers] = useState<number>(0);
  const [pageviews, setpageviews] = useState<number>(0);
  const [session, setSession] = useState<number>(0);
  const [directSessions, setDirectSessions] = useState(0);
  const [referralSessions, setReferralSessions] = useState(0);
  const [toolbasedsession, settoolbasedsession] = useState(0);
  const [localhostsession, setlocalhostsession] = useState(0);
  const [totalEngagementDuration, setTotalEngagementDuration] = useState<number>(0);
  const [value, setValue] = useState(0);
  const [activetab, setActivetab] = useState(0);
  const [addtocart, setAddtocart] = useState<Cartdata[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [analysisdata, setAnalysisdata] = useState<Analysis[]>([]);
  const [currentpage, setcurrentpage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");

  const lastSegment = (path: string) => {
    const segments = path.split("/");
    return segments[segments.length - 1];
  };

  const filterByDateRange = (data: any[], dateField: string = "Date") => {
    if (!Array.isArray(data)) {
      console.error(" filterByDateRange Error: Expected array but got:", data);
      return [];
    }

    const now = new Date();
    const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
    const daysToSubtract = daysMap[dateRange];
    const cutoffDate = new Date(now.setDate(now.getDate() - daysToSubtract));

    return data.filter((item) => {
      const itemDateStr = item[dateField];

      if (!itemDateStr) return false;

      let itemDate: Date;

      if (itemDateStr.length === 8) {
        const year = parseInt(itemDateStr.slice(0, 4), 10);
        const month = parseInt(itemDateStr.slice(4, 6), 10) - 1;
        const day = parseInt(itemDateStr.slice(6, 8), 10);
        itemDate = new Date(year, month, day);
      } else {
        itemDate = new Date(itemDateStr);
      }

      return itemDate >= cutoffDate;
    });
  };
  // Filtered analytics data based on date range
  const filteredAnalyticsData = useMemo(() => {
    return filterByDateRange(analyticsData);
  }, [analyticsData, dateRange]);

  // Filtered analysis data based on date range
  const filteredAnalysisDataByRange = useMemo(() => {
    return filterByDateRange(analysisdata, "date");
  }, [analysisdata, dateRange]);

  // Memoized unique values from filtered data
  const uniqueData = useMemo(() => {
    return {
      cities: Array.from(new Set(filteredAnalyticsData.map((item) => item.city))).filter(
        Boolean
      ),
      countries: Array.from(new Set(filteredAnalyticsData.map((item) => item.country))).filter(
        Boolean
      ),
      pageTitles: Array.from(
        new Set(
          filteredAnalyticsData
            .filter(
              (item) =>
                item.pageTitle &&
                item.pageTitle !== "Unknown Page Title" &&
                item.pageTitle !== "(not set)"
            )
            .map((item) => item.pageTitle)
        )
      ).filter(Boolean),
      pagePaths: Array.from(
        new Set(filteredAnalyticsData.map((item) => lastSegment(item.pagePath)))
      ).filter(Boolean),
      deviceCategories: Array.from(
        new Set(filteredAnalyticsData.map((item) => item.deviceCategory))
      ).filter(Boolean),
      browsers: Array.from(new Set(filteredAnalyticsData.map((item) => item.browser))).filter(
        Boolean
      ),
      events: Array.from(new Set(filteredAnalyticsData.map((item) => item.eventname))).filter(
        Boolean
      ),
      sessionSources: Array.from(
        new Set(
          filteredAnalyticsData
            .filter((item) => item.sessionsource && item.sessionsource !== "(not set)")
            .map((item) => item.sessionsource)
        )
      ).filter(Boolean),
    };
  }, [filteredAnalyticsData]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateMetrics(filteredAnalyticsData);
  }, [filteredAnalyticsData]);

  const calculateMetrics = (data: AnalyticsItem[]) => {
    const total = data.reduce((sum: number, item: AnalyticsItem) => {
      return sum + (item.eventCount ? parseInt(item.eventCount, 10) : 0);
    }, 0);
    setTotalcount(total);

    const active = data.reduce((sum: number, item: AnalyticsItem) => {
      return sum + (item.activeuser ? parseInt(item.activeuser, 10) : 0);
    }, 0);
    setactiveusers(active);

    const totalpageviews = data.reduce((sum: number, item: AnalyticsItem) => {
      return sum + (item.pageViews ? parseInt(item.pageViews, 10) : 0);
    }, 0);
    setpageviews(totalpageviews);

    const totalDuration = data.reduce((sum: number, item: AnalyticsItem) => {
      return (
        sum +
        (item.userEngagementDuration ? parseFloat(item.userEngagementDuration) : 0)
      );
    }, 0);
    setTotalEngagementDuration(totalDuration);

    const totalsession = data.reduce((sum: number, item: AnalyticsItem) => {
      return sum + (item.sessions ? parseInt(item.sessions, 10) : 0);
    }, 0);
    setSession(totalsession);

    const direct = data.find((item: any) => item.sessionsource === "direct");
    const toolbased = data.find(
      (item: any) => item.sessionsource === "tagassistant.google.com"
    );
    const localhost = data.find(
      (item: any) => item.sessionsource === "localhost:3000"
    );
    const referralData = data.filter(
      (item: any) =>
        item.sessionsource &&
        ![
          "direct",
          "tagassistant.google.com",
          "localhost:3000",
          "(not set)",
        ].includes(item.sessionsource)
    );

    const referralSessions = referralData.reduce(
      (sum: number, item: any) =>
        sum + (item.sessions ? parseInt(item.sessions, 10) : 0),
      0
    );

    setDirectSessions(direct ? parseInt(direct.sessions, 10) : 0);
    setReferralSessions(referralSessions);
    settoolbasedsession(toolbased ? parseInt(toolbased.sessions, 10) : 0);
    setlocalhostsession(localhost ? parseInt(localhost.sessions, 10) : 0);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ga4data");
      const data = await response.json();
      setAnalyticsData(data);
      calculateMetrics(filterByDateRange(data));
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchcartdata = async () => {
      const res = await fetch("/api/add_to_cart");
      const resdata = await res.json();
      setAddtocart(resdata);
    };
    fetchcartdata();
  }, []);

  useEffect(() => {
    const analysisFetchdata = async () => {
      const res = await fetch("/api/ga4");
      const analysis = await res.json();
      setAnalysisdata(analysis);
    };
    analysisFetchdata();
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleSeedBlogs = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    try {
      const res = await apiClient.post(apiClient.URLS.blogSeed, {}, true);
      const { created, failed } = res.body;
      toast.success(`Seeded ${created} blogs successfully${failed ? ` (${failed} failed)` : ""}`);
    } catch (err: any) {
      toast.error(err?.body?.message || "Failed to seed blogs");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDateRangeChange = (range: "7d" | "30d" | "90d") => {
    setDateRange(range);
    setcurrentpage(1);
  };

  const formatNumber = (number: number) => {
    if (number >= 1000000) {
      return `${(number / 1000000).toFixed(1)}M`;
    }
    if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}K`;
    }
    return number.toString();
  };

  const formattedDate = (datestring: string) => {
    const year = parseInt(datestring.slice(0, 4), 10);
    const month = parseInt(datestring.slice(4, 6), 10) - 1;
    const day = parseInt(datestring.slice(6, 8), 10);
    const date = new Date(year, month, day);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const averageEngagementTime = useMemo(() => {
    if (session === 0) return 0;
    return (totalEngagementDuration / session).toFixed(2);
  }, [totalEngagementDuration, session]);

  const bounceRate = useMemo(() => {
    const totalBounceRate = filteredAnalysisDataByRange.reduce(
      (sum, item) => sum + item.bounceRate,
      0
    );
    return filteredAnalysisDataByRange.length > 0
      ? (totalBounceRate / filteredAnalysisDataByRange.length).toFixed(2)
      : 0;
  }, [filteredAnalysisDataByRange]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            family: "Gordita-Medium",
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          family: "Gordita-Bold",
          size: 14,
        },
        bodyFont: {
          family: "Gordita-Regular",
          size: 12,
        },
        borderColor: "#5297ff",
        borderWidth: 1,
      },
    },
  };

  const getCitiesByCountry = (country: string) => {
    const cities = filteredAnalyticsData
      .filter((item) => item.country === country && item.city)
      .map((item) => item.city);
    return [...new Set(cities)];
  };

  const getCityData = (city: string) => {
    return filteredAnalyticsData.filter((item) => item.city === city);
  };

  const filteredAnalysisData = filteredAnalysisDataByRange.filter(
    (item) => item.city === selectedCity
  );
  const filteredAnalysisDatabyCountry = filteredAnalysisDataByRange.filter(
    (item) => item.country === selectedCountry
  );

  const ItemsperPage = 10;
  const totalpages = Math.ceil(filteredAnalysisData.length / ItemsperPage);
  const totalcountrypages = Math.ceil(
    filteredAnalysisDatabyCountry.length / ItemsperPage
  );

  const handleNextpage = () => {
    if (currentpage < totalpages) {
      setcurrentpage(currentpage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentpage > 1) {
      setcurrentpage(currentpage - 1);
    }
  };

  const handleCountryNextpage = () => {
    if (currentpage < totalcountrypages) {
      setcurrentpage(currentpage + 1);
    }
  };

  const handlecountryPreviousPage = () => {
    if (currentpage > 1) {
      setcurrentpage(currentpage - 1);
    }
  };

  const calculateCountryTotals = () => {
    return filteredAnalysisDataByRange.reduce((acc, item) => {
      if (!acc[item.country]) {
        acc[item.country] = { sessions: 0, activeUsers: 0, bounceRate: 0, count: 0 };
      }
      acc[item.country].sessions += item.sessions;
      acc[item.country].activeUsers += item.activeUsers;
      const bounceRate = item.bounceRate;
      if (!isNaN(bounceRate)) {
        acc[item.country].bounceRate += bounceRate;
        acc[item.country].count += 1;
      }
      return acc;
    }, {} as Record<string, { sessions: number; activeUsers: number; bounceRate: number; count: number }>);
  };

  const countryTotals = useMemo(() => {
    const totals = calculateCountryTotals();
    Object.keys(totals).forEach((country) => {
      const avgBounceRate =
        totals[country].count > 0
          ? totals[country].bounceRate / totals[country].count
          : 0;
      totals[country].bounceRate = parseFloat(avgBounceRate.toFixed(2));
    });
    return totals;
  }, [filteredAnalysisDataByRange]);

  // Get date range label
  const getDateRangeLabel = () => {
    const labels = {
      "7d": "Last 7 Days",
      "30d": "Last 30 Days",
      "90d": "Last 90 Days",
    };
    return labels[dateRange];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/10">
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Analytics Dashboard
              </h1>
              <p className="text-[10px] md:text-[13px] font-regular text-gray-600">
                Real-time insights and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-[6px] p-[2px] shadow-sm">
                <Calendar className="w-4 h-4 text-gray-400 ml-2" />
                {(["7d", "30d", "90d"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => handleDateRangeChange(range)}
                    className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${dateRange === range
                      ? "bg-[#5297ff] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    {range === "7d" && "7 Days"}
                    {range === "30d" && "30 Days"}
                    {range === "90d" && "90 Days"}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-[4px] bg-white border border-gray-200 rounded-[6px] hover:bg-gray-50 transition-colors shadow-sm"
                disabled={isLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                <span className="font-medium text-sm">Refresh</span>
              </Button>
              <Button className="flex items-center gap-2 px-4 py-1 bg-[#5297ff] text-white rounded-[6px] hover:bg-[#4080dd] transition-colors shadow-sm">
                <Download className="w-4 h-4" />
                <span className="font-medium text-sm">Export</span>
              </Button>
              <Button
                onClick={handleSeedBlogs}
                disabled={isSeeding}
                className="flex items-center gap-2 px-4 py-[4px] bg-emerald-600 text-white rounded-[6px] hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Database
                  className={`w-4 h-4 ${isSeeding ? "animate-pulse" : ""}`}
                />
                <span className="font-medium text-sm">
                  {isSeeding ? "Seeding..." : "Seed Blogs"}
                </span>
              </Button>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1 bg-blue-50 border border-blue-200 rounded-[6px] mb-6">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Showing data for: {getDateRangeLabel()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <MetricCard
              title="Total Active Users"
              value={formatNumber(activeusers)}
              icon={<Users className="w-6 h-6" />}
              trend={12.5}
              subtitle="Unique visitors"
              gradient="from-blue-500 to-blue-600"
            />
            <MetricCard
              title="Page Views"
              value={formatNumber(pageviews)}
              icon={<Eye className="w-6 h-6" />}
              trend={8.2}
              subtitle="Total impressions"
              gradient="from-green-500 to-green-600"
            />
            <MetricCard
              title="Total Sessions"
              value={formatNumber(session)}
              icon={<Activity className="w-6 h-6" />}
              trend={-3.1}
              subtitle="User sessions"
              gradient="from-purple-500 to-purple-600"
            />
            <MetricCard
              title="Avg. Engagement"
              value={`${averageEngagementTime}s`}
              icon={<Clock className="w-6 h-6" />}
              trend={15.7}
              subtitle="Per session"
              gradient="from-orange-500 to-orange-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white rounded-[6px] border border-gray-200 md:p-4 p-2 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">
                  Bounce Rate
                </span>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {bounceRate}%
              </p>
              <p className="text-xs font-regular text-gray-500">
                Average across all pages
              </p>
            </div>

            <div className="bg-white rounded-[6px] border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">
                  Total Events
                </span>
                <MousePointer className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {formatNumber(totalCount)}
              </p>
              <p className="text-xs font-regular text-gray-500">
                User interactions tracked
              </p>
            </div>

            <div className="bg-white rounded-[6px] border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">
                  Referral Traffic
                </span>
                <Globe className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {session > 0 ? ((referralSessions / session) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-xs font-regular text-gray-500">
                Of total sessions
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-gray-200 shadow-sm p-2 md:p-3">
          <div className="border-b border-gray-200 mb-6 overflow-x-auto">
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="analytics tabs"
              variant="scrollable"
              scrollButtons="auto"
              TabIndicatorProps={{
                style: {
                  backgroundColor: "#5297ff",
                  height: "3px",
                  borderRadius: "3px 3px 0 0",
                },
              }}
              sx={{
                minHeight: "40px",
                "& .MuiTab-root": {
                  minHeight: "40px",
                  textTransform: "none",
                  fontFamily: "Gordita-Medium",
                  fontSize: "14px",
                  color: "#6b7280",
                  "&.Mui-selected": {
                    color: "#5297ff",
                  },
                },
              }}
            >
              {[
                { label: "City Analytics", icon: <MapPin className="w-4 h-4" /> },
                { label: "Country", icon: <Globe className="w-4 h-4" /> },
                { label: "World Overview", icon: <Globe className="w-4 h-4" /> },
                { label: "Page Views", icon: <Eye className="w-4 h-4" /> },
                { label: "Page Paths", icon: <BarChart3 className="w-4 h-4" /> },
                { label: "Devices", icon: <Smartphone className="w-4 h-4" /> },
                { label: "Events", icon: <MousePointer className="w-4 h-4" /> },
                { label: "Sessions", icon: <Activity className="w-4 h-4" /> },
                { label: "User Activity", icon: <Users className="w-4 h-4" /> },
              ].map((tab, index) => (
                <Tab
                  key={index}
                  label={
                    <div className="flex items-center gap-2">
                      {tab.icon}
                      <span>{tab.label}</span>
                    </div>
                  }
                  {...a11yProps(index)}
                />
              ))}
            </Tabs>
          </div>

          <CustomTabPanel value={value} index={0}>
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Select Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <SingleSelect
                      type="single-select"
                      name="country"
                      label="Country"
                      labelCls="label-text text-gray-500"
                      rootCls="w-full border-2 border-gray-200 rounded-[6px] bg-white"
                      buttonCls="border-none py-2"
                      options={uniqueData.countries.map((country) => ({
                        name: country,
                      }))}
                      selectedOption={{
                        name: selectedCountry || "Select Country",
                      }}
                      optionsInterface={{
                        isObj: true,
                        displayKey: "name",
                      }}
                      handleChange={(name, value) => {
                        setSelectedCountry(value.name);
                        setSelectedCity(null);
                      }}
                    />
                  </div>
                  <div>
                    <SingleSelect
                      type="single-select"
                      name="city"
                      label="City"
                      labelCls="label-text text-gray-500"
                      options={getCitiesByCountry(selectedCountry || "").map(
                        (c) => ({ name: c })
                      )}
                      rootCls="w-full border-2 border-gray-200 rounded-[6px] bg-white"
                      buttonCls="border-none py-2"
                      selectedOption={{
                        name: selectedCity || "Select City",
                      }}
                      optionsInterface={{
                        isObj: true,
                        displayKey: "name",
                      }}
                      handleChange={(name, value) => setSelectedCity(value.name)}
                    />
                  </div>
                </div>
              </div>

              {selectedCity && (
                <>
                  {/* City Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h4 className="text-base font-bold text-gray-900 mb-4">
                        Device Distribution
                      </h4>
                      <div className="h-64">
                        <Doughnut
                          data={{
                            labels: uniqueData.deviceCategories,
                            datasets: [
                              {
                                data: [
                                  getCityData(selectedCity)
                                    .filter((item) => item.deviceCategory === "desktop")
                                    .reduce(
                                      (sum, item) => sum + parseInt(item.pageViews || "0"),
                                      0
                                    ),
                                  getCityData(selectedCity)
                                    .filter((item) => item.deviceCategory === "mobile")
                                    .reduce(
                                      (sum, item) => sum + parseInt(item.pageViews || "0"),
                                      0
                                    ),
                                ],
                                backgroundColor: ["#5297ff", "#10b981"],
                                borderWidth: 2,
                                borderColor: "#fff",
                              },
                            ],
                          }}
                          options={{
                            ...chartOptions,
                            cutout: "70%",
                          }}
                        />
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h4 className="text-base font-bold text-gray-900 mb-4">
                        Page Performance
                      </h4>
                      <div className="h-64">
                        <Bar
                          data={{
                            labels: Array.from(
                              new Set(
                                getCityData(selectedCity).map((item) =>
                                  lastSegment(item.pagePath)
                                )
                              )
                            ),
                            datasets: [
                              {
                                label: "Page Views",
                                data: getCityData(selectedCity).map((item) =>
                                  parseInt(item.pageViews || "0", 10)
                                ),
                                backgroundColor: "#5297ff",
                                borderRadius: 6,
                              },
                              {
                                label: "Events",
                                data: getCityData(selectedCity).map((item) =>
                                  parseInt(item.eventCount || "0", 10)
                                ),
                                backgroundColor: "#10b981",
                                borderRadius: 6,
                              },
                            ],
                          }}
                          options={{
                            ...chartOptions,
                            scales: {
                              y: {
                                beginAtZero: true,
                                grid: {
                                  color: "#f3f4f6",
                                },
                              },
                              x: {
                                grid: {
                                  display: false,
                                },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* City Data Table */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <h4 className="text-lg font-bold text-gray-900">
                        Detailed Analytics - {selectedCity}
                      </h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                              Date
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                              Bounce Rate
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                              Sessions
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                              Active Users
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                              Country
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredAnalysisData
                            .slice(
                              (currentpage - 1) * ItemsperPage,
                              currentpage * ItemsperPage
                            )
                            .map((item, index) => (
                              <tr
                                key={index}
                                className="hover:bg-blue-50/50 transition-colors"
                              >
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                  {formattedDate(item.date)}
                                </td>
                                <td className="px-6 py-4 text-sm font-regular text-center text-gray-600">
                                  {item.bounceRate}%
                                </td>
                                <td className="px-6 py-4 text-sm font-regular text-center text-gray-600">
                                  {item.sessions}
                                </td>
                                <td className="px-6 py-4 text-sm font-regular text-center text-gray-600">
                                  {item.activeUsers}
                                </td>
                                <td className="px-6 py-4 text-sm font-regular text-right text-gray-600">
                                  {item.country}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                      <div className="text-sm font-regular text-gray-600">
                        Showing {(currentpage - 1) * ItemsperPage + 1} to{" "}
                        {Math.min(currentpage * ItemsperPage, filteredAnalysisData.length)} of{" "}
                        {filteredAnalysisData.length} results
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handlePreviousPage}
                          disabled={currentpage === 1}
                          className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-[6px] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </Button>
                        <div className="px-4 py-2 text-sm font-medium bg-[#5297ff] text-white rounded-[6px]">
                          {currentpage} / {totalpages}
                        </div>
                        <Button
                          onClick={handleNextpage}
                          disabled={currentpage === totalpages}
                          className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-[6px] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CustomTabPanel>

          <CustomTabPanel value={value} index={1}>
            <div className="space-y-6">
              {/* Country Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {uniqueData.countries.map((country, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActivetab(index);
                      setSelectedCountry(country);
                      setcurrentpage(1);
                    }}
                    className={`px-6 py-3 rounded-[6px] font-medium text-sm whitespace-nowrap transition-all ${activetab === index
                      ? "bg-[#5297ff] text-white shadow-lg"
                      : "bg-white border border-gray-200 text-gray-700 hover:border-[#5297ff]"
                      }`}
                  >
                    {country}
                  </button>
                ))}
              </div>

              {selectedCountry && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h4 className="text-lg font-bold text-gray-900">
                      Analytics for {selectedCountry}
                    </h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                            Date
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                            Bounce Rate
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                            Sessions
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                            Active Users
                          </th>
                          <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                            City
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredAnalysisDatabyCountry
                          .slice(
                            (currentpage - 1) * ItemsperPage,
                            currentpage * ItemsperPage
                          )
                          .map((item, index) => (
                            <tr
                              key={index}
                              className="hover:bg-blue-50/50 transition-colors"
                            >
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {formattedDate(item.date)}
                              </td>
                              <td className="px-6 py-4 text-sm font-regular text-center text-gray-600">
                                {item.bounceRate}%
                              </td>
                              <td className="px-6 py-4 text-sm font-regular text-center text-gray-600">
                                {item.sessions}
                              </td>
                              <td className="px-6 py-4 text-sm font-regular text-center text-gray-600">
                                {item.activeUsers}
                              </td>
                              <td className="px-6 py-4 text-sm font-regular text-right text-gray-600">
                                {item.city}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm font-regular text-gray-600">
                      Page {currentpage} of {totalcountrypages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handlecountryPreviousPage}
                        disabled={currentpage === 1}
                        className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-[6px] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={handleCountryNextpage}
                        disabled={currentpage === totalcountrypages}
                        className="px-4 py-2 text-sm font-medium bg-[#5297ff] text-white rounded-[6px] hover:bg-[#4080dd] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CustomTabPanel>

          <CustomTabPanel value={value} index={2}>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h4 className="text-lg font-bold text-gray-900">
                  Global Analytics Overview
                </h4>
                <p className="text-sm font-regular text-gray-600 mt-1">
                  Aggregated data from all countries
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                        Country
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                        Total Sessions
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                        Active Users
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                        Avg. Bounce Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(countryTotals)
                      .sort((a: any, b: any) => b[1].sessions - a[1].sessions)
                      .map(([country, totals]: any, index) => (
                        <tr
                          key={index}
                          className="hover:bg-blue-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                                {index + 1}
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {country}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-regular text-center text-gray-600">
                            {formatNumber(totals.sessions)}
                          </td>
                          <td className="px-6 py-4 text-sm font-regular text-center text-gray-600">
                            {formatNumber(totals.activeUsers)}
                          </td>
                          <td className="px-6 py-4 text-sm font-regular text-right">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${totals.bounceRate < 40
                                ? "bg-green-100 text-green-700"
                                : totals.bounceRate < 60
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                                }`}
                            >
                              {totals.bounceRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CustomTabPanel>

          <CustomTabPanel value={value} index={3}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-1">
                    Page Views by Path
                  </h4>
                  <p className="text-sm font-regular text-gray-600">
                    {formatNumber(pageviews)} total views
                  </p>
                </div>
                <div className="h-80">
                  <Bar
                    data={{
                      labels: uniqueData.pagePaths,
                      datasets: [
                        {
                          label: "Page Views",
                          data: filteredAnalyticsData.map((item) =>
                            parseInt(item.pageViews || "0")
                          ),
                          backgroundColor: "#5297ff",
                          borderRadius: 8,
                        },
                      ],
                    }}
                    options={{
                      ...chartOptions,
                      indexAxis: "y" as const,
                      scales: {
                        x: {
                          beginAtZero: true,
                          grid: {
                            color: "#f3f4f6",
                          },
                        },
                        y: {
                          grid: {
                            display: false,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-1">
                    Views by City
                  </h4>
                  <p className="text-sm font-regular text-gray-600">
                    Geographic distribution
                  </p>
                </div>
                <div className="h-80">
                  <Bar
                    data={{
                      labels: uniqueData.cities,
                      datasets: [
                        {
                          label: "Page Views",
                          data: filteredAnalyticsData.map((item) =>
                            parseInt(item.pageViews || "0")
                          ),
                          backgroundColor: "#10b981",
                          borderRadius: 8,
                        },
                      ],
                    }}
                    options={{
                      ...chartOptions,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: "#f3f4f6",
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </CustomTabPanel>

          <CustomTabPanel value={value} index={4}>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-1">
                  User Engagement by Page
                </h4>
                <p className="text-sm font-regular text-gray-600">
                  Total engagement: {formatNumber(totalEngagementDuration)}s
                </p>
              </div>
              <div className="h-96">
                <Bar
                  data={{
                    labels: uniqueData.pagePaths,
                    datasets: [
                      {
                        label: "Engagement Duration (s)",
                        data: filteredAnalyticsData.map((item) =>
                          parseFloat(item.userEngagementDuration || "0")
                        ),
                        backgroundColor: "#8b5cf6",
                        borderRadius: 8,
                      },
                    ],
                  }}
                  options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: "#f3f4f6",
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </CustomTabPanel>

          <CustomTabPanel value={value} index={5}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-1">
                    Device Distribution
                  </h4>
                  <p className="text-sm font-regular text-gray-600">
                    {formatNumber(pageviews)} total views
                  </p>
                </div>
                <div className="h-80 flex items-center justify-center">
                  <div className="w-full max-w-md">
                    <Doughnut
                      data={{
                        labels: uniqueData.deviceCategories,
                        datasets: [
                          {
                            data: [
                              filteredAnalyticsData
                                .filter((item) => item.deviceCategory === "desktop")
                                .reduce(
                                  (sum, item) => sum + parseInt(item.pageViews || "0"),
                                  0
                                ),
                              filteredAnalyticsData
                                .filter((item) => item.deviceCategory === "mobile")
                                .reduce(
                                  (sum, item) => sum + parseInt(item.pageViews || "0"),
                                  0
                                ),
                            ],
                            backgroundColor: ["#5297ff", "#10b981"],
                            borderWidth: 3,
                            borderColor: "#fff",
                          },
                        ],
                      }}
                      options={{
                        ...chartOptions,
                        cutout: "65%",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-1">
                    Device Statistics
                  </h4>
                  <p className="text-sm font-regular text-gray-600">
                    Usage breakdown by device type
                  </p>
                </div>
                <div className="space-y-4">
                  {uniqueData.deviceCategories.map((device, index) => {
                    const deviceViews = filteredAnalyticsData
                      .filter((item) => item.deviceCategory === device)
                      .reduce(
                        (sum, item) => sum + parseInt(item.pageViews || "0"),
                        0
                      );
                    const percentage =
                      pageviews > 0
                        ? ((deviceViews / pageviews) * 100).toFixed(1)
                        : "0";

                    return (
                      <div
                        key={index}
                        className="p-4 rounded-[6px] border border-gray-200 hover:border-[#5297ff] transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-[6px] flex items-center justify-center ${device === "desktop"
                                ? "bg-blue-100"
                                : "bg-green-100"
                                }`}
                            >
                              <Smartphone
                                className={`w-5 h-5 ${device === "desktop"
                                  ? "text-blue-600"
                                  : "text-green-600"
                                  }`}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 capitalize">
                                {device}
                              </p>
                              <p className="text-xs font-regular text-gray-600">
                                {formatNumber(deviceViews)} views
                              </p>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-gray-900">
                            {percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${device === "desktop" ? "bg-blue-500" : "bg-green-500"
                              }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CustomTabPanel>

          <CustomTabPanel value={value} index={6}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-1">
                    Event Timeline
                  </h4>
                  <p className="text-sm font-regular text-gray-600">
                    {formatNumber(totalCount)} total events
                  </p>
                </div>
                <div className="h-80">
                  <Line
                    data={{
                      labels: uniqueData.pagePaths,
                      datasets: [
                        {
                          label: "Event Count",
                          data: filteredAnalyticsData.map((item) =>
                            parseInt(item.eventCount || "0")
                          ),
                          borderColor: "#5297ff",
                          backgroundColor: "rgba(82, 151, 255, 0.1)",
                          fill: true,
                          tension: 0.4,
                          borderWidth: 3,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-1">
                    Events by Type
                  </h4>
                  <p className="text-sm font-regular text-gray-600">
                    Distribution of event categories
                  </p>
                </div>
                <div className="h-80 flex items-center justify-center">
                  <div className="w-full max-w-md">
                    <Doughnut
                      data={{
                        labels: uniqueData.events.filter(
                          (event) =>
                            event &&
                            ![
                              "steps",
                              "scroll",
                              "step_completion",
                              "cart_step_completed",
                              "first_visit",
                              "form_start",
                              "session_start",
                              "user_engagement",
                              "Login Form",
                            ].includes(event)
                        ),
                        datasets: [
                          {
                            data: filteredAnalyticsData
                              .filter(
                                (item) =>
                                  item.eventname &&
                                  ![
                                    "steps",
                                    "scroll",
                                    "step_completion",
                                    "cart_step_completed",
                                    "first_visit",
                                    "form_start",
                                    "session_start",
                                    "user_engagement",
                                    "Login Form",
                                  ].includes(item.eventname)
                              )
                              .map((item) => parseInt(item.eventCount || "0")),
                            backgroundColor: [
                              "#5297ff",
                              "#10b981",
                              "#f59e0b",
                              "#ef4444",
                              "#8b5cf6",
                              "#ec4899",
                              "#06b6d4",
                              "#84cc16",
                            ],
                            borderWidth: 3,
                            borderColor: "#fff",
                          },
                        ],
                      }}
                      options={{
                        ...chartOptions,
                        cutout: "60%",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Add to Cart Table */}
              {addtocart.length > 0 && (
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h4 className="text-lg font-bold text-gray-900">
                      Add to Cart Events
                    </h4>
                    <p className="text-sm font-regular text-gray-600 mt-1">
                      Products added to cart
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                            ID
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                            Product Name
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                            Category
                          </th>
                          <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                            Event Count
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {addtocart
                          .filter(
                            (item) => item.itemName && item.itemName !== "(not set)"
                          )
                          .map((item, index) => (
                            <tr
                              key={index}
                              className="hover:bg-blue-50/50 transition-colors"
                            >
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                #{item.itemId}
                              </td>
                              <td className="px-6 py-4 text-sm font-regular text-gray-600">
                                {item.itemName}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                  {item.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-right text-gray-900">
                                {item.eventCount}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </CustomTabPanel>

          <CustomTabPanel value={value} index={7}>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-1">
                  Session Sources
                </h4>
                <p className="text-sm font-regular text-gray-600">
                  {formatNumber(session)} total sessions
                </p>
              </div>
              <div className="h-96">
                <Bar
                  data={{
                    labels: ["Direct", "Referral", "Tool Based", "Localhost"],
                    datasets: [
                      {
                        label: "Sessions",
                        data: [
                          directSessions,
                          referralSessions,
                          toolbasedsession,
                          localhostsession,
                        ],
                        backgroundColor: ["#5297ff", "#10b981", "#f59e0b", "#8b5cf6"],
                        borderRadius: 8,
                      },
                    ],
                  }}
                  options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: "#f3f4f6",
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              </div>

              {/* Session Source Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                {[
                  {
                    label: "Direct",
                    value: directSessions,
                    color: "blue",
                    percentage:
                      session > 0
                        ? ((directSessions / session) * 100).toFixed(1)
                        : "0",
                  },
                  {
                    label: "Referral",
                    value: referralSessions,
                    color: "green",
                    percentage:
                      session > 0
                        ? ((referralSessions / session) * 100).toFixed(1)
                        : "0",
                  },
                  {
                    label: "Tool Based",
                    value: toolbasedsession,
                    color: "orange",
                    percentage:
                      session > 0
                        ? ((toolbasedsession / session) * 100).toFixed(1)
                        : "0",
                  },
                  {
                    label: "Localhost",
                    value: localhostsession,
                    color: "purple",
                    percentage:
                      session > 0
                        ? ((localhostsession / session) * 100).toFixed(1)
                        : "0",
                  },
                ].map((source, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-[6px] border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {source.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mb-2">
                      {formatNumber(source.value)}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full bg-${source.color}-500`}
                          style={{ width: `${source.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {source.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CustomTabPanel>

          <CustomTabPanel value={value} index={8}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-1">
                    Active Users by City
                  </h4>
                  <p className="text-sm font-regular text-gray-600">
                    {formatNumber(activeusers)} total active users
                  </p>
                </div>
                <div className="h-80 flex items-center justify-center">
                  <div className="w-full max-w-md">
                    <Pie
                      data={{
                        labels: uniqueData.cities,
                        datasets: [
                          {
                            data: uniqueData.cities.map((city) =>
                              filteredAnalyticsData
                                .filter((item) => item.city === city)
                                .reduce(
                                  (sum, item) => sum + parseInt(item.activeuser || "0"),
                                  0
                                )
                            ),
                            backgroundColor: [
                              "#5297ff",
                              "#10b981",
                              "#f59e0b",
                              "#ef4444",
                              "#8b5cf6",
                              "#ec4899",
                            ],
                            borderWidth: 3,
                            borderColor: "#fff",
                          },
                        ],
                      }}
                      options={chartOptions}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-1">
                    User Activity Timeline
                  </h4>
                  <p className="text-sm font-regular text-gray-600">
                    Activity trends over time
                  </p>
                </div>
                <div className="h-80">
                  <Line
                    data={{
                      labels: Array.from(
                        new Set(
                          filteredAnalyticsData.map((item) => formattedDate(item.Date))
                        )
                      ),
                      datasets: [
                        {
                          label: "Active Users",
                          data: filteredAnalyticsData.map((item) =>
                            parseInt(item.activeuser || "0")
                          ),
                          borderColor: "#10b981",
                          backgroundColor: "rgba(16, 185, 129, 0.1)",
                          fill: true,
                          tension: 0.4,
                          borderWidth: 3,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                </div>
              </div>
            </div>
          </CustomTabPanel>
        </div>
      </div>
    </div>
  );
}