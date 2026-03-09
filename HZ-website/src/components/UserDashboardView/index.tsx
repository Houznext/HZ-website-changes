import React from "react";
import Link from "next/link";
import { FiArrowRight, FiMapPin, FiGrid } from "react-icons/fi";

export default function UserDashBoardView() {
  const dashboardCards = [
    {
      title: "Interior Projects",
      description: "View all your active and completed interior projects.",
      href: "/user/custom-builder",
    },
    {
      title: "Interior Tracking",
      description: "Track progress updates managed by the admin team.",
      href: "/user/custom-builder",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-3 md:p-6">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-5 py-7 text-white shadow-lg">
        <p className="text-xs uppercase tracking-[0.14em] text-blue-200">Houznext</p>
        <h1 className="mt-2 text-2xl font-semibold md:text-3xl">Customer Dashboard</h1>
        <p className="mt-2 text-sm text-slate-200">
          Track your interior journey with project status and milestone updates.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {dashboardCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{card.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{card.description}</p>
              </div>
              <span className="rounded-md bg-blue-50 p-2 text-[#3586FF]">
                <FiGrid />
              </span>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#3586FF]">
              Open Module <FiArrowRight />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2 font-medium text-slate-800">
          <FiMapPin className="text-[#3586FF]" /> Admin progress updates sync directly into your Interior Tracking view.
        </span>
      </div>
    </div>
  );
}
