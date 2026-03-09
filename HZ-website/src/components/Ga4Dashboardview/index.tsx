import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

import { Pie } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

ChartJS.register(ArcElement, Tooltip, Legend);

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);
interface AnalyticsItem {
  pageTitle: string;
  pagePath: string;
  pageViews: string;
  country?: string;
  deviceCategory?: string;
  userType?: string;
  browser?: string;
  city?: string;
  //operatingSystem?: string;
  sessions?: string;
  userEngagementDuration?: string;
  eventCount?: string;
  activeuser: string;
  sessionsource: string;
  Date: string;
  eventname: string;
}
interface Cartdata {
  itemId: number;
  itemName: string;
  category: string;
  eventCount: number;
}

export default function Ga4Dasboardview() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsItem[]>([]);
  const [totalCount, setTotalcount] = useState<number>(0);
  const [activeusers, setactiveusers] = useState<number>(0);
  const [session, setSession] = useState<number>(0);
  const [directSessions, setDirectSessions] = useState(0);
  const [referralSessions, setReferralSessions] = useState(0);
  const [toolbasedsession, settoolbasedsession] = useState(0);
  const [localhostsession, setlocalhostsession] = useState(0);
  const [totalEngagementDuration, setTotalEngagementDuration] =
    useState<number>(0);
  const [pageviews, setpageviews] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/ga4data");
      const data = await response.json();
      setAnalyticsData(data);

      const total = data.reduce((sum: number, item: AnalyticsItem) => {
        return sum + (item.eventCount ? parseInt(item.eventCount, 10) : 0);
      }, 0);

      setTotalcount(total);
      const active = data.reduce((sum: number, item: AnalyticsItem) => {
        return sum + (item.activeuser ? parseInt(item.activeuser, 10) : 0);
      }, 0);
      setactiveusers(active);
      const totalsession = data.reduce((sum: number, item: AnalyticsItem) => {
        return sum + (item.sessions ? parseInt(item.sessions, 10) : 0);
      }, 0);
      setSession(totalsession);
      const totalDuration = data.reduce((sum: number, item: AnalyticsItem) => {
        return (
          sum +
          (item.userEngagementDuration
            ? parseFloat(item.userEngagementDuration)
            : 0)
        );
      }, 0);
      setTotalEngagementDuration(totalDuration);
      const totalpageviews = data.reduce((sum: number, item: AnalyticsItem) => {
        return sum + (item.pageViews ? parseInt(item.pageViews, 10) : 0);
      }, 0);
      setpageviews(totalpageviews);

      const direct = data.find((item: any) => item.sessionsource == "direct");
      const toolbased = data.find(
        (item: any) => item.sessionsource == "tagassistant.google.com"
      );
      const localhost = data.find(
        (item: any) => item.sessionsource == "localhost:3000"
      );
      // const referral = data.find(
      //   (item: any) =>
      //     item.sessionsource &&
      //     !["(direct)", "tagassistant.google.com", "localhost:3000", "(not set)"].includes(
      //       item.sessionsource
      //     )
      // );
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

    fetchData();
  }, []);

  const page = analyticsData?.map((item) => item.deviceCategory);
  const device = Array.from(new Set(page));

  const eventCounts = analyticsData.map((item) =>
    item.eventCount ? parseInt(item.eventCount, 10) : 0
  );
  const lastSegment = (path: string) => {
    const segments = path.split("/");
    return segments[segments.length - 1];
  };

  const pathsdata = analyticsData.map((item) => lastSegment(item.pagePath));
  const paths = Array.from(new Set(pathsdata));

  const data = {
    labels: paths,
    datasets: [
      {
        label: "Event Count",
        data: eventCounts,
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const label = tooltipItem.dataset.label;
            const value = tooltipItem.raw;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };
  const cityUserCounts: { [key: string]: number } = {};

  analyticsData.forEach((item) => {
    if (item.city && item.activeuser) {
      const activeCount = parseInt(item.activeuser, 10);
      if (cityUserCounts[item.city]) {
        cityUserCounts[item.city] += activeCount;
      } else {
        cityUserCounts[item.city] = activeCount;
      }
    }
  });

  const cityLabels = Object.keys(cityUserCounts);
  const cityData = Object.values(cityUserCounts);

  const piedata = {
    labels: cityLabels,
    datasets: [
      {
        data: cityData,
        backgroundColor: [
          "rgba(75,192,192,0.6)",
          "rgba(255,99,132,0.6)",
          "rgba(255,159,64,0.6)",
          "rgba(153,102,255,0.6)",
          "rgba(255,205,86,0.6)",
          "rgba(54,162,235,0.6)",
        ],
        hoverBackgroundColor: [
          "rgba(75,192,192,1)",
          "rgba(255,99,132,1)",
          "rgba(255,159,64,1)",
          "rgba(153,102,255,1)",
          "rgba(255,205,86,1)",
          "rgba(54,162,235,1)",
        ],
      },
    ],
  };

  const piechartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const city = tooltipItem.label;
            const value = tooltipItem.raw;
            return `${city}: ${value} Active Users`;
          },
        },
      },
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          padding: 10,
          generateLabels: (chart: any) => {
            const labels = chart.data.labels;
            return labels.map((label: string, index: number) => ({
              text: label,
              fillStyle: chart.data.datasets[0].backgroundColor[index],
            }));
          },
        },
      },
    },
  };
  const columnChartData = {
    labels: ["Referral Sessions", "Direct Sessions", "tool based", "localhost"],
    datasets: [
      {
        label: "Sessions",
        data: [
          directSessions,
          referralSessions,
          toolbasedsession,
          localhostsession,
        ],
        backgroundColor: ["#FF5733", "#33FF57"],
        borderColor: ["#FF5733", "#33FF57"],
        borderWidth: 1,
      },
    ],
  };

  const columnChartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const label = tooltipItem.label;
            const value = tooltipItem.raw;
            return `${label}: ${value} sessions`;
          },
        },
      },
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  const engagementDurations = analyticsData.map((item) =>
    item.userEngagementDuration ? parseFloat(item.userEngagementDuration) : 0
  );
  const activeUserDurations = analyticsData.map((item) =>
    item.activeuser ? parseInt(item.activeuser, 10) : 0
  );

  const pathdata = {
    labels: paths,
    datasets: [
      {
        label: "User Engagement Duration",
        data: engagementDurations,
        backgroundColor: "#4caf50",
        stack: "stack1",
      },
    ],
  };

  const pathchartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const label = tooltipItem.dataset.label;
            const value = tooltipItem.raw;
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
        stacked: true,
      },
    },
  };
  const formatNumber = (number: number): string => {
    if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}k`;
    }
    return number.toString();
  };
  const formatednumber = formatNumber(totalEngagementDuration);
  const totalCountnumber = formatNumber(totalCount);
  const activeusercount = formatNumber(activeusers);
  const sessioncount = formatNumber(session);
  const formattedPageViwesData = formatNumber(pageviews);
  const formattedDate = (datestring: string) => {
    const year = parseInt(datestring.slice(0, 4), 10);
    const month = parseInt(datestring.slice(4, 6), 10) - 1;
    const day = parseInt(datestring.slice(6, 8), 10);
    const date = new Date(year, month, day);
    return date.toISOString().split("T")[0];
  };
  const Datesdata = analyticsData.map((item) => formattedDate(item.Date));

  const Dates = Array.from(new Set(Datesdata));
  const pageviwesData = analyticsData?.map((item) => item.pageViews);

  const lineChartData = {
    labels: Dates,
    datasets: [
      {
        label: "Page Views",
        data: pageviwesData,
        fill: false,
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.1,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const label = tooltipItem.dataset.label;
            const value = tooltipItem.raw;
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "page views",
        },
        beginAtZero: true,
      },
    },
  };

  const desktopPageViews = analyticsData
    .map((item) => (item.deviceCategory === "desktop" ? item.pageViews : false))
    .filter((item) => item !== false)
    .flat()
    .map((view) => parseInt(view))
    .reduce((total, currentValue) => total + currentValue, 0);

  const mobilePageViews = analyticsData
    .map((item) => (item.deviceCategory === "mobile" ? item.pageViews : false))
    .filter((item) => item !== false)
    .flat()
    .map((view) => parseInt(view))
    .reduce((total, currentValue) => total + currentValue, 0);

  const donutchartdata = {
    labels: device,
    datasets: [
      {
        label: "Page Views by Device",
        data: [desktopPageViews, mobilePageViews],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverOffset: 4,
      },
    ],
  };

  const donutchartoptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const label = tooltipItem.label;
            const value = tooltipItem.raw;
            return `${label}: ${value} pageviews`;
          },
        },
      },
    },
  };
  const activeuserChartData = {
    labels: Dates,
    datasets: [
      {
        label: "activeuser",
        data: activeusercount,
        fill: false,
        borderColor: "rgba(175, 225, 2, 1)",
        tension: 0.1,
      },
    ],
  };

  const activeuserChartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const label = tooltipItem.dataset.label;
            const value = tooltipItem.raw;
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "User",
        },
        beginAtZero: true,
      },
    },
  };
  const pageviewspathdata = {
    labels: paths,
    datasets: [
      {
        label: "pageviews",
        data: pageviwesData,
        backgroundColor: "#6dcd60",
        stack: "stack1",
      },
    ],
  };

  const pageviewspathOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const label = tooltipItem.dataset.label;
            const value = tooltipItem.raw;
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
        stacked: true,
      },
    },
  };
  const event = analyticsData.map((item) => item.eventname);
  const eventnames = Array.from(new Set(event));
  const aggregateEventCounts = (names: string[], counts: number[]) => {
    const eventMap = new Map<string, number>();

    names.forEach((name, index) => {
      if (eventMap.has(name)) {
        eventMap.set(name, eventMap.get(name)! + counts[index]);
      } else {
        eventMap.set(name, counts[index]);
      }
    });

    return Array.from(eventMap.entries()).map(([name, total]) => ({
      name,
      count: total,
    }));
  };

  const aggregatedData = aggregateEventCounts(eventnames, eventCounts);
  const eventnamedata = {
    labels: aggregatedData
      .filter(
        (data) =>
          data.name !== null &&
          data.name !== "steps" &&
          data.name !== "scroll" &&
          data.name !== "step_completion" &&
          data.name !== "cart_step_completed" &&
          data.name !== "first_visit" &&
          data.name !== "form_start" &&
          data.name !== "session_start" &&
          data.name !== "user_engagement" &&
          data.name !== "Login Form"
      )
      .map((data) => data.name),
    datasets: [
      {
        label: "Page Views by Device",
        data: aggregatedData
          .filter(
            (data) =>
              data.name !== null &&
              data.name !== "steps" &&
              data.name !== "scroll" &&
              data.name !== "step_completion" &&
              data.name !== "cart_step_completed" &&
              data.name !== "first_visit" &&
              data.name !== "form_start" &&
              data.name !== "session_start" &&
              data.name !== "user_engagement" &&
              data.name !== "Login Form"
          )
          .map((data) => data.count),
        backgroundColor: [
          "#36A2EB", // Light Blue
          "#FF6384", // Pink
          "#FF9F40", // Orange
          "#4BC0C0", // Teal
          "#9966FF", // Purple
          "#FFCD56", // Yellow
          "#C9CBCF", // Grey
          "#2E93fA", // Dark Blue
          "#66DA26", // Green
          "#546E7A", // Slate
          "#E91abc", // Deep Pink
          "#F9C80E", // Bright Yellow
          "#EA3546", // Red
          "#118DF0", // Royal Blue
        ],
        hoverOffset: 4,
      },
    ],
  };

  const eventnamechartoptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const label = tooltipItem.label;
            const value = tooltipItem.raw;
            return `${label}: ${value} events`;
          },
        },
      },
    },
  };
  const citychartData = {
    labels: cityLabels,
    datasets: [
      {
        label: "pageviews by city",
        data: pageviwesData,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const citychartoptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const label = tooltipItem.label;
            const value = tooltipItem.raw;
            return `${label}: ${value} pageviews`;
          },
        },
      },
      title: {
        display: true,
        text: " Page by City",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "City",
        },
      },
      y: {
        title: {
          display: true,
          text: "pageviews",
        },
      },
    },
  };
  const [addtocart, setAddtocart] = useState<Cartdata[]>([]);
  useEffect(() => {
    const fetchcartdata = async () => {
      const res = await fetch("/api/add_to_cart");
      const resdata = await res.json();
      setAddtocart(resdata);
    };
    fetchcartdata();
  }, []);
  const [removecart, setremovecart] = useState<Cartdata[]>([]);
  useEffect(() => {
    const fetchremovecartdata = async () => {
      const res = await fetch("/api/removefromcart");
      const resdata = await res.json();
      setremovecart(resdata);
    };
    fetchremovecartdata();
  }, []);

  const [viewcart, setviewcart] = useState<Cartdata[]>([]);
  useEffect(() => {
    const fetchviewcartdata = async () => {
      const res = await fetch("/api/viewcart");
      const resdata = await res.json();
      setviewcart(resdata);
    };
    fetchviewcartdata();
  }, []);

  return (
    <>
      <div className="flex flex-col items-center gap-y-[60px]">
        <div className="flex items-center justify-center w-full h-full mt-[30px]">
          <div className="flex items-center flex-wrap gap-x-[48px] gap-y-[20px]">
            <div className="flex flex-col items-center justify-center rounded-[8px] bg-gradient-to-b from-white via-gray-200 to-gray-400 p-4 w-[435px] h-[393px] gap-y-[30px] ">
              <h1 className="font-bold text-[32px] text-[#000000] leading-[22.5px]">
                All events
              </h1>
              <h2 className="font-regular text-[20px] text-gray-700">
                {totalCountnumber}
              </h2>
              <div className="my-6 w-[100%] flex items-center justify-center mx-auto">
                <Line data={data} options={chartOptions} />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-[8px] bg-gradient-to-b from-white via-gray-200 to-gray-400 p-4 w-[435px] h-[393px] gap-y-[20px] ">
              <h1 className="font-bold text-[32px] text-[#000000] leading-[22.5px]">
                Active Users
              </h1>
              <h1 className="font-regular text-[20px] text-gray-900">
                {activeusercount}
              </h1>
              <div className="my-6 w-[45%] flex items-center justify-center mx-auto">
                <Pie data={piedata} options={piechartOptions} />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-[8px] bg-gradient-to-b from-white via-gray-200 to-gray-400 p-4 w-[435px] h-[393px] gap-y-[20px] ">
              <h1 className="font-bold text-[32px] text-[#000000] leading-[22.5px]">
                Sessions
              </h1>
              <h1 className="font-regular text-[20px] text-gray-900">
                {sessioncount}
              </h1>
              <div className="my-6  flex items-center justify-center mx-auto">
                <Bar data={columnChartData} options={columnChartOptions} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-x-[40px] justify-around w-full gap-y-[20px]">
          <div className="flex flex-col items-center gap-y-[20px]">
            <h1 className="font-bold text-[32px] text-[#000000] leading-[22.5px]">
              User Engagement by page
            </h1>
            <h1 className="font-regular text-[20px] text-gray-700">
              {formatednumber}
            </h1>
            <div className="w-full h-full max-w-[1100px]">
              <Bar data={pathdata} options={pathchartOptions} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-y-[20px]">
            <h1 className="font-bold text-[32px] text-[#000000] leading-[22.5px]">
              Page Views by Date
            </h1>
            <h1 className="font-regular text-[20px] text-gray-700">
              {formattedPageViwesData}
            </h1>
            <div className="w-full h-full max-w-[1100px]">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-x-[40px] justify-around w-full gap-y-[20px] ">
          <div className="flex flex-col items-center gap-y-[20px]">
            <h1 className="font-bold text-[32px] text-[#000000] leading-[22.5px]">
              Page Views by Device
            </h1>
            <h1 className="font-regular text-[20px] text-gray-700">
              {formattedPageViwesData}
            </h1>
            <div className="w-[80%] h-full max-w-[1100px]">
              <Doughnut data={donutchartdata} options={donutchartoptions} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-y-[20px]">
            <h1 className="font-bold text-[32px] text-[#000000] leading-[22.5px]">
              active users by Date
            </h1>
            <h1 className="font-regular text-[20px] text-gray-700">
              {activeusercount}
            </h1>
            <div className="w-full h-full max-w-[1100px]">
              <Line
                data={activeuserChartData}
                options={activeuserChartOptions}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex flex-col items-center gap-y-[20px] w-[100%]">
            <h1 className="font-bold text-[32px] text-[#000000] leading-[22.5px]">
              Page Views by Page
            </h1>
            <h1 className="font-regular text-[20px] text-gray-700">
              {formattedPageViwesData}
            </h1>
            <div className="w-[50vw] h-full ">
              <Bar data={pageviewspathdata} options={pageviewspathOptions} />
            </div>
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-x-[40px] gap-y-[20px] justify-around w-full ">
          <div className="flex flex-col items-center gap-y-[20px]">
            <h1 className="font-bold text-[32px] text-[#000000] leading-[22.5px]">
              event count by event Names
            </h1>
            <h1 className="font-regular text-[20px] text-gray-700">
              {totalCountnumber}
            </h1>
            <div className="w-[80%] h-full max-w-[1100px]">
              <Doughnut data={eventnamedata} options={eventnamechartoptions} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-y-[20px] h-[100%]">
            <h1 className="font-bold text-[32px] text-[#000000] leading-[22.5px]">
              Page views by City
            </h1>
            <h1 className="font-regular text-[20px] text-gray-700">
              {formattedPageViwesData}
            </h1>
            <div className="md:w-[50vw] w-[100vw] h-full max-w-[1100px]">
              <Bar data={citychartData} options={citychartoptions} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center  justify-center flex-wrap gap-x-[40px] gap-y-[40px]">
        <div className="flex items-center justify-center flex-col gap-y-[20px]">
          <h1>Add to cart</h1>
          <div>
            <table>
              <thead>
                <tr>
                  <th className="border px-4 py-2">id</th>
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Category</th>
                  <th className="border px-4 py-2">Eventcount</th>
                </tr>
              </thead>

              <tbody>
                {addtocart.length > 0 &&
                  addtocart
                    .filter(
                      (item) => item.itemName && item.itemName !== "(not set)"
                    )
                    .map((item, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2 text-center">
                          {item.itemId}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          {item.itemName}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          {item.category}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          {item.eventCount}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex items-center justify-center flex-col gap-y-[20px]">
          <h1>remove from cart</h1>
          <div>
            <table>
              <thead>
                <tr>
                  <th className="border px-4 py-2">id</th>
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Category</th>
                  <th className="border px-4 py-2">Eventcount</th>
                </tr>
              </thead>

              <tbody>
                {removecart.length > 0 &&
                  removecart
                    .filter(
                      (item) => item.itemName && item.itemName !== "(not set)"
                    )
                    .map((item, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2 text-center">
                          {item.itemId}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          {item.itemName}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          {item.category}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          {item.eventCount}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/*<div>
      <div className="flex items-center justify-center flex-col gap-y-[20px] mt-[20px]">
        <h1>view cart</h1>
        <div>
          <table>
            <thead>
              <tr>
                <th className="border px-4 py-2">id</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Category</th>
                <th className="border px-4 py-2">Eventcount</th>
              </tr>
            </thead>

            <tbody>
              {viewcart.length > 0 &&
                viewcart
                  .filter(
                    (item) => item.itemName && item.itemName !== "(not set)"
                  ) 
                  .map((item, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2 text-center">
                        {item.itemId}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {item.itemName}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {item.category}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {item.eventCount}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>*/}
    </>
  );
}
