"use client";
import React from "react";
import PropertiesNavbar from "../PropertiesNavbar";
import GeneralFooter from "../../GeneralLayout/Footer";
import { usePropertyFilterStore } from "@/store/usePropertyFilterStore";

interface PropertiesLayoutWrapperProps {
  children: React.ReactNode;
  isDetailPage?: boolean; 
}

const PropertiesLayoutWrapper: React.FC<PropertiesLayoutWrapperProps> = ({
  children,
  isDetailPage = false, 
}) => {
  const {
    activeTab,
    filters,
    selectedCities,
    setActiveTab,
    setFilters,
    setSelectedCities,
  } = usePropertyFilterStore();

  return (
    <div className="flex flex-col h-full min-h-screen justify-between max-w-full mx-auto pr-1">
      <PropertiesNavbar isDetailPage={isDetailPage} /> 
      <div className="flex-grow flex-1 h-full min-h-full">{children}</div>
      <GeneralFooter />
    </div>
  );
};

export default PropertiesLayoutWrapper;
