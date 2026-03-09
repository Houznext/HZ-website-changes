import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  MdSettings,
  MdArrowForward,
  MdClose,
  MdEmail,
  MdPhone,
  MdMenuBook,
  MdHelp,
  MdSupportAgent,
} from "react-icons/md";
import { FaUser, FaWhatsapp, FaCalendarCheck } from "react-icons/fa";
import { PiBuildings } from "react-icons/pi";
import { LuNetwork } from "react-icons/lu";
import Button from "@/src/common/Button";

const subLinks = [
  {
    name: "User Management",
    link: "/settings/user-management",
    icon: <FaUser className="text-xl" />,
    desc: "Manage users, permissions, and profiles",
    table: "user",
    iconBg: "bg-blue-500",
    hoverBg: "hover:bg-blue-50",
    borderColor: "hover:border-blue-300",
  },
  {
    name: "Careers",
    link: "/settings/careersAdmin",
    icon: <PiBuildings className="text-xl" />,
    desc: "Manage job postings and applications",
    table: "careers",
    iconBg: "bg-violet-500",
    hoverBg: "hover:bg-violet-50",
    borderColor: "hover:border-violet-300",
  },
  {
    name: "Branches",
    link: "/settings/branches",
    icon: <LuNetwork className="text-xl" />,
    desc: "Manage branch locations and settings",
    table: "branch",
    iconBg: "bg-amber-500",
    hoverBg: "hover:bg-amber-50",
    borderColor: "hover:border-amber-300",
  },
  {
    name: "Attendance",
    link: "/settings/attendance-management",
    icon: <FaCalendarCheck className="text-xl" />,
    desc: "Manage employee attendance and records",
    table: "attendance",
    iconBg: "bg-emerald-500",
    hoverBg: "hover:bg-emerald-50",
    borderColor: "hover:border-emerald-300",
  },
];

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocumentationModal = ({ isOpen, onClose }: DocumentationModalProps) => {
  if (!isOpen) return null;

  const documentationSections = [
    {
      title: "Getting Started",
      icon: <MdMenuBook className="text-xl" />,
      color: "bg-blue-500",
      items: [
        "Introduction to the platform",
        "User account setup",
        "Navigation guide",
        "Basic features overview",
      ],
    },
    {
      title: "User Management",
      icon: <MdHelp className="text-xl" />,
      color: "bg-violet-500",
      items: [
        "Creating and managing users",
        "Role assignment",
        "Permission settings",
        "User activity monitoring",
      ],
    },
    {
      title: "Advanced Features",
      icon: <MdSupportAgent className="text-xl" />,
      color: "bg-emerald-500",
      items: [
        "Branch configuration",
        "Career management",
        "Attendance tracking",
        "Reporting and analytics",
      ],
    },
  ];

  const handleEmailClick = () => {
    window.location.href = "mailto:admin@onecasa.in";
  };

  const handlePhoneClick = () => {
    window.location.href = "tel:+918897574909";
  };

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/918897574909", "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: "slideUp 0.3s ease-out" }}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <MdMenuBook className="text-3xl text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Help & Documentation
                </h2>
                <p className="text-slate-300 text-sm mt-1">
                  Everything you need to know
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-colors duration-200"
            >
              <MdClose className="text-2xl text-white" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-8">
          {/* Documentation Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {documentationSections.map((section, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-2.5 ${section.color} rounded-xl text-white shadow-md`}
                  >
                    {section.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-2.5">
                  {section.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-600 flex items-start gap-2"
                    >
                      <span className="text-gray-300 mt-0.5">-</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl px-6 py-4 border border-gray-200">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Need More Help?
              </h3>
              <p className="text-gray-500">
                Our support team is here to assist you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={handleEmailClick}
                className="group bg-white hover:bg-blue-500 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-500"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-blue-100 group-hover:bg-white/20 rounded-xl transition-colors duration-300">
                    <MdEmail className="text-2xl text-blue-500 group-hover:text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 group-hover:text-blue-100 mb-1 transition-colors duration-300">
                      Email Us
                    </p>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-white transition-colors duration-300 break-all">
                      admin@onecasa.in
                    </p>
                  </div>
                </div>
              </Button>

              <Button
                onClick={handlePhoneClick}
                className="group bg-white hover:bg-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-slate-700"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-slate-100 group-hover:bg-white/20 rounded-xl transition-colors duration-300">
                    <MdPhone className="text-2xl text-slate-600 group-hover:text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 group-hover:text-slate-300 mb-1 transition-colors duration-300">
                      Call Us
                    </p>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-white transition-colors duration-300">
                      +91 86398 20425
                    </p>
                  </div>
                </div>
              </Button>

              <Button
                onClick={handleWhatsAppClick}
                className="group bg-white hover:bg-green-500 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-green-500"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-green-100 group-hover:bg-white/20 rounded-xl transition-colors duration-300">
                    <FaWhatsapp className="text-2xl text-green-600 group-hover:text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 group-hover:text-green-100 mb-1 transition-colors duration-300">
                      WhatsApp
                    </p>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-white transition-colors duration-300">
                      Chat with us
                    </p>
                  </div>
                </div>
              </Button>
            </div>

            {/* Business Hours */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-sm border border-gray-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Support Hours:</span> Mon - Fri,
                  9:00 AM - 6:00 PM IST
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-8 py-4 bg-gray-50/50">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-500">
              Can&apos;t find what you&apos;re looking for?
            </p>
            <Button
              onClick={handleEmailClick}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-all duration-300 text-sm"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

const SettingsView = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (link: string) => {
    router.push(link);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-start">
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <MdSettings className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                Settings
              </h1>
              <p className="text-gray-500 mt-1 label-text">
                Manage your application settings and configurations
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subLinks.map((item, index) => (
            <div
              key={index}
              onClick={() => handleClick(item.link)}
              className={`group relative bg-white rounded-2xl border-2 border-gray-100 ${item.borderColor} ${item.hoverBg} px-6 py-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex-shrink-0 w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 text-lg group-hover:text-gray-900 transition-colors">
                    {item.name}
                  </h2>
                  <p className="text-gray-500 font-regular sublabel-text text-sm mt-0.5">
                    {item.desc}
                  </p>
                </div>
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <MdArrowForward className="text-xl text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl px-6 py-4 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <MdHelp className="text-2xl text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">
                  Need Help?
                </h3>
                <p className="text-slate-300 text-sm sublabel-text">
                  Check out our documentation or contact support
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2.5 bg-white text-slate-900 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View Documentation
            </Button>
          </div>
        </div>
      </div>

      <DocumentationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default SettingsView;