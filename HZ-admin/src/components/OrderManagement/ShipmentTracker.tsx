"use client";

import React, { useState, useCallback } from "react";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import { FaTruck, FaCheckCircle, FaMapMarkerAlt, FaExternalLinkAlt } from "react-icons/fa";

type TrackingActivity = {
  date: string;
  status: string;
  activity: string;
  location: string;
  "sr-status-label"?: string;
};

type TrackingData = {
  tracking_data?: {
    shipment_track?: Array<{
      current_status: string;
      delivered_date: string;
      edd: string | null;
      courier_agent_details: string | null;
    }>;
    shipment_track_activities?: TrackingActivity[];
    track_url?: string;
    etd?: string;
  };
};

const PIPELINE_STEPS = [
  { key: "ORDER_PLACED", label: "Order Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PICKUP_SCHEDULED", label: "Pickup Scheduled" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "IN_TRANSIT", label: "In Transit" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

function getActiveStep(activities: TrackingActivity[], currentStatus?: string): number {
  if (!currentStatus) return 0;
  const status = currentStatus.toLowerCase();
  if (status.includes("delivered")) return 6;
  if (status.includes("out for delivery")) return 5;
  if (status.includes("in transit") || status.includes("reached")) return 4;
  if (status.includes("shipped") || status.includes("picked")) return 3;
  if (status.includes("pickup")) return 2;
  if (status.includes("confirmed") || status.includes("manifest")) return 1;
  return 0;
}

export default function ShipmentTracker({
  awbCode,
  courierName,
  orderStatus,
}: {
  awbCode?: string;
  courierName?: string;
  orderStatus?: string;
}) {
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchTracking = useCallback(async () => {
    if (!awbCode) return;
    setLoading(true);
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.shiprocket}/track/${awbCode}`,
        {},
        true
      );
      setTracking(res.body);
      setExpanded(true);
    } catch {
      toast.error("Failed to fetch tracking info");
    } finally {
      setLoading(false);
    }
  }, [awbCode]);

  if (!awbCode) return null;

  const shipment = tracking?.tracking_data?.shipment_track?.[0];
  const activities = tracking?.tracking_data?.shipment_track_activities ?? [];
  const trackUrl = tracking?.tracking_data?.track_url;
  const activeStep = shipment
    ? getActiveStep(activities, shipment.current_status)
    : orderStatus === "DELIVERED"
      ? 6
      : orderStatus === "OUT_FOR_DELIVERY"
        ? 5
        : orderStatus === "SHIPPED"
          ? 3
          : 1;

  return (
    <div className="bg-white rounded-xl border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaTruck className="text-blue-500" />
          <span className="text-sm font-semibold">Shipment Tracking</span>
        </div>
        <div className="flex items-center gap-2">
          {courierName && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{courierName}</span>
          )}
          <span className="text-xs text-gray-500 font-mono">AWB: {awbCode}</span>
        </div>
      </div>

      {/* Progress pipeline */}
      <div className="flex items-center gap-0.5">
        {PIPELINE_STEPS.map((step, i) => {
          const isCompleted = i <= activeStep;
          const isCurrent = i === activeStep;
          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center min-w-[32px]">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                    ${isCurrent ? "bg-blue-600 text-white ring-2 ring-blue-200" : isCompleted ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"}`}
                >
                  {isCompleted ? "✓" : i + 1}
                </div>
                <span className={`text-[9px] mt-1 text-center leading-tight ${isCurrent ? "text-blue-700 font-semibold" : isCompleted ? "text-green-700" : "text-gray-400"}`}>
                  {step.label}
                </span>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mt-[-12px] ${isCompleted && i < activeStep ? "bg-green-500" : "bg-gray-200"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ETA + current status */}
      {shipment && (
        <div className="flex items-center gap-4 text-xs text-gray-600">
          {shipment.current_status && (
            <span>Current: <strong>{shipment.current_status}</strong></span>
          )}
          {shipment.edd && (
            <span>ETA: <strong>{new Date(shipment.edd).toLocaleDateString()}</strong></span>
          )}
          {shipment.delivered_date && (
            <span className="text-green-600">Delivered: {new Date(shipment.delivered_date).toLocaleDateString()}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={fetchTracking}
          disabled={loading}
          className="text-xs px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition"
        >
          {loading ? "Loading..." : tracking ? "Refresh Tracking" : "Load Tracking"}
        </button>

        {trackUrl && (
          <a
            href={trackUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            Track on Shiprocket <FaExternalLinkAlt className="text-[9px]" />
          </a>
        )}
      </div>

      {/* Activity log */}
      {expanded && activities.length > 0 && (
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">Activity Log</p>
          <div className="relative pl-4 border-l-2 border-gray-200 space-y-2 max-h-48 overflow-y-auto">
            {activities.map((a, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-blue-400 border border-white" />
                <div className="text-[11px]">
                  <span className="font-medium text-gray-800">{a["sr-status-label"] || a.status}</span>
                  {a.location && (
                    <span className="text-gray-500 ml-1">
                      <FaMapMarkerAlt className="inline text-[9px]" /> {a.location}
                    </span>
                  )}
                  <p className="text-gray-400">{a.activity}</p>
                  <p className="text-gray-400">{new Date(a.date).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
