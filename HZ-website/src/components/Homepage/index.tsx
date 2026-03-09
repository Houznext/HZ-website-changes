import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import BlogCard from "../BlogCard";
import MobileBlogCard from "@/components/MobileBlogCard";

type HomepageProps = {
  initialBlogs: any[];
};

const Homepage = ({ initialBlogs }: HomepageProps) => {
  const blogList = initialBlogs || [];

  return (
    <div className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-10 md:px-10 md:py-14 text-white shadow-xl"
        >
          <p className="text-sm uppercase tracking-[0.16em] text-blue-200">Houznext Interiors</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-5xl">Premium Interiors For Modern Homes</h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-200 md:text-base">
            Discover design-first interiors with transparent execution tracking and smart cost planning.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="rounded-md bg-[#3586FF] px-5 py-2.5 text-sm font-medium text-white" href="/interiors">
              Explore Interiors
            </Link>
            <Link className="rounded-md border border-white/30 px-5 py-2.5 text-sm font-medium text-white" href="/interiors/cost-estimator">
              Interior Cost Calculator
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 pb-8 md:grid-cols-3">
        {[
          { title: "Interior Projects", desc: "Track all active interior projects in one dashboard.", href: "/user/custom-builder" },
          { title: "Interior Tracking", desc: "View real-time progress updates from your project team.", href: "/user/custom-builder" },
          { title: "Refer & Earn", desc: "Invite friends and earn benefits on successful interior referrals.", href: "/referandearn" },
        ].map((card) => (
          <Link key={card.title} href={card.href} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{card.desc}</p>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Latest Blogs</h2>
          <Link href="/blogs" className="text-sm font-medium text-[#3586FF]">View all</Link>
        </div>
        <div className="hidden md:grid grid-cols-3 gap-5">
          {blogList.length > 0 ? (
            blogList.slice(0, 3).map((blog: any, index: number) => (
              <div key={index} className="rounded-xl bg-white p-2 shadow-sm">
                <BlogCard data={blog} />
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-500">No blogs available right now.</div>
          )}
        </div>
        <div className="md:hidden flex flex-col gap-3">
          {blogList.slice(0, 3).map((blog: any, index: number) => (
            <div key={index} className="rounded-xl bg-white p-2 shadow-sm">
              <MobileBlogCard data={blog} />
            </div>
          ))}
          {blogList.length === 0 && (
            <div className="text-sm text-slate-500">No blogs available right now.</div>
          )}
        </div>
      </section>
    </div>
  )
};

export default Homepage;
