import React, { useMemo, useRef, useState } from "react";
import { PlacedPlan, PlacedRoom } from "@/src/lib/floorplan/contracts";
import Button from "@/src/common/Button";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

interface Props {
  plan: PlacedPlan;
  onTryFlexible?: () => void;
  propertyId?: string;
  customBuilderId?: string;
}

/* ── Drawing constants ────────────────────────────────────────────────── */
const PX_PER_FT = 28;
const SVG_MARGIN = 80;

/* Wall thicknesses (in px at PX_PER_FT scale) */
const OUTER_WALL_PX = 6;   // ~0.75ft / 9 inches visual
const INNER_WALL_PX = 3;   // ~0.375ft / 4.5 inches visual

/* Colors — monochrome architectural style */
const COLORS = {
  bg: "#ffffff",
  wall: "#1a1a1a",
  roomFill: "#ffffff",
  roomHover: "#f0f7ff",
  label: "#1a1a1a",
  dimension: "#555555",
  window: "#1a1a1a",
  dimLine: "#888888",
};

/* ── Utility helpers ──────────────────────────────────────────────────── */

/** Convert decimal feet to Indian dimension string: W'-H" */
const ftToLabel = (ft: number): string => {
  const feet = Math.floor(ft);
  const inches = Math.round((ft - feet) * 12);
  if (inches === 0) return `${feet}'-0"`;
  if (inches === 12) return `${feet + 1}'-0"`;
  return `${feet}'-${inches}"`;
};

/** Get the line coordinates for a wall side of a rectangle */
const wallLine = (
  rect: { x: number; y: number; width: number; height: number },
  wall: "N" | "S" | "E" | "W"
) => {
  if (wall === "N")
    return { x1: rect.x, y1: rect.y, x2: rect.x + rect.width, y2: rect.y };
  if (wall === "S")
    return {
      x1: rect.x,
      y1: rect.y + rect.height,
      x2: rect.x + rect.width,
      y2: rect.y + rect.height,
    };
  if (wall === "E")
    return {
      x1: rect.x + rect.width,
      y1: rect.y,
      x2: rect.x + rect.width,
      y2: rect.y + rect.height,
    };
  return { x1: rect.x, y1: rect.y, x2: rect.x, y2: rect.y + rect.height };
};

/* ── Component ────────────────────────────────────────────────────────── */

const FloorPlanSvgViewer: React.FC<Props> = ({
  plan,
  onTryFlexible,
  propertyId,
  customBuilderId,
}) => {
  const [selectedPortionIndex, setSelectedPortionIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    plan.portions[0]?.variants[0]?.variantId || ""
  );
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lastPoint, setLastPoint] = useState({ x: 0, y: 0 });
  const [hoverRoom, setHoverRoom] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const selectedPortion =
    plan.portions[selectedPortionIndex] || plan.portions[0];
  const selectedVariant =
    selectedPortion?.variants.find((v) => v.variantId === selectedVariantId) ||
    selectedPortion?.variants[0];

  const warnings = useMemo(() => {
    const all = [
      ...(plan.warnings || []),
      ...(selectedVariant?.warnings || []),
    ];
    return Array.from(new Set(all));
  }, [plan.warnings, selectedVariant?.warnings]);

  if (!selectedVariant) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        Plan generation failed or returned no variants.
        {onTryFlexible ? (
          <button className="ml-2 underline" onClick={onTryFlexible}>
            Try again with flexible vastu
          </button>
        ) : null}
      </div>
    );
  }

  /* ── Dimensions ──────────────────────────────────────────────────── */
  const bw = selectedVariant.boundaryFt.width;
  const bh = selectedVariant.boundaryFt.length;
  const contentW = bw * PX_PER_FT;
  const contentH = bh * PX_PER_FT;
  const viewW = contentW + SVG_MARGIN * 2;
  const viewH = contentH + SVG_MARGIN * 2;
  const ox = SVG_MARGIN; // origin X
  const oy = SVG_MARGIN; // origin Y

  /* ── Map room rectFt to SVG coordinates ─────────────────────────── */
  /* Solver: (0,0) = SW, y↑ = North.  SVG: (0,0) = top-left, y↓.     */
  /* We want North at top, South at bottom → flip Y.                   */
  const toSvgRect = (r: { x: number; y: number; width: number; height: number }) => ({
    x: ox + r.x * PX_PER_FT,
    y: oy + (bh - r.y - r.height) * PX_PER_FT,
    width: r.width * PX_PER_FT,
    height: r.height * PX_PER_FT,
  });

  /* ── Shared wall detection (for drawing inner walls) ────────────── */
  type WallSegment = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    isOuter: boolean;
  };

  const wallSegments = useMemo(() => {
    const segments: WallSegment[] = [];
    const rooms = selectedVariant.rooms;
    const eps = 0.1;

    // Collect all room edges
    type Edge = { axis: "H" | "V"; pos: number; start: number; end: number; roomId: string };
    const edges: Edge[] = [];

    rooms.forEach((room) => {
      const r = room.rectFt;
      const x0 = r.x, y0 = r.y;
      const x1 = x0 + r.width, y1 = y0 + r.height;
      edges.push({ axis: "H", pos: y0, start: x0, end: x1, roomId: room.id }); // South
      edges.push({ axis: "H", pos: y1, start: x0, end: x1, roomId: room.id }); // North
      edges.push({ axis: "V", pos: x0, start: y0, end: y1, roomId: room.id }); // West
      edges.push({ axis: "V", pos: x1, start: y0, end: y1, roomId: room.id }); // East
    });

    // Group edges that coincide (shared walls between rooms)
    const drawnSet = new Set<string>();

    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      const key = `${e.axis}_${e.pos.toFixed(1)}_${e.start.toFixed(1)}_${e.end.toFixed(1)}`;
      if (drawnSet.has(key)) continue;
      drawnSet.add(key);

      // Is this edge on the outer boundary?
      const isOuter =
        (e.axis === "H" && (Math.abs(e.pos) < eps || Math.abs(e.pos - bh) < eps)) ||
        (e.axis === "V" && (Math.abs(e.pos) < eps || Math.abs(e.pos - bw) < eps));

      if (e.axis === "H") {
        const svgY = oy + (bh - e.pos) * PX_PER_FT;
        segments.push({
          x1: ox + e.start * PX_PER_FT,
          y1: svgY,
          x2: ox + e.end * PX_PER_FT,
          y2: svgY,
          isOuter,
        });
      } else {
        const svgX = ox + e.pos * PX_PER_FT;
        segments.push({
          x1: svgX,
          y1: oy + (bh - e.end) * PX_PER_FT,
          x2: svgX,
          y2: oy + (bh - e.start) * PX_PER_FT,
          isOuter,
        });
      }
    }

    return segments;
  }, [selectedVariant.rooms, bw, bh, ox, oy]);

  /* ── Export helpers ──────────────────────────────────────────────── */
  const exportSvg = () => {
    if (!svgRef.current) return;
    const source = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `floorplan-${plan.planId}-${selectedVariant.variantId}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPng = async () => {
    if (!svgRef.current) return;
    const source = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewW * 2);
      canvas.height = Math.ceil(viewH * 2);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(2, 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, viewW, viewH);
      ctx.drawImage(img, 0, 0, viewW, viewH);
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `floorplan-${plan.planId}-${selectedVariant.variantId}.png`;
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const exportPdf = async () => {
    if (!svgRef.current) return;
    const source = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewW * 2);
      canvas.height = Math.ceil(viewH * 2);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(2, 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, viewW, viewH);
      ctx.drawImage(img, 0, 0, viewW, viewH);
      const pdf = new jsPDF({
        orientation: viewW > viewH ? "landscape" : "portrait",
        unit: "px",
        format: [viewW, viewH],
      });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, viewW, viewH);
      pdf.save(`floorplan-${plan.planId}-${selectedVariant.variantId}.pdf`);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const saveToBackend = async () => {
    if (!svgRef.current) return;
    const base = (process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT || "").replace(/\/$/, "");
    if (!base) {
      toast.error("NEXT_PUBLIC_LOCAL_API_ENDPOINT is not configured");
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    try {
      const response = await fetch(`${base}/floorplans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.planId,
          variantId: selectedVariant.variantId,
          propertyId,
          customBuilderId,
          svgData,
          placedPlan: selectedVariant,
          metadata: {
            source: "dreamcasaAdmin",
            portionIndex: selectedPortion.portionIndex,
            floorIndex: selectedPortion.floorIndex,
            floorName: selectedPortion.floorName,
            portionType: selectedPortion.portionType,
          },
          warnings,
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body?.message || body?.error || "Failed to save");
      toast.success("Floorplan saved to backend");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save floorplan");
    }
  };

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="space-y-4">
      {/* Portion selector */}
      <div className="flex flex-wrap items-center gap-2">
        {plan.portions.map((portion, idx) => (
          <button
            key={`${portion.floorIndex}-${portion.portionIndex}`}
            className={`rounded border px-3 py-1 text-xs ${
              idx === selectedPortionIndex
                ? "border-blue-600 bg-blue-50 font-semibold text-blue-700"
                : "border-gray-300"
            }`}
            onClick={() => {
              setSelectedPortionIndex(idx);
              setSelectedVariantId(portion.variants[0]?.variantId || "");
            }}
          >
            {portion.floorName} / {portion.portionType}
          </button>
        ))}
      </div>

      {/* Variant selector */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {selectedPortion.variants.map((variant) => (
          <button
            key={variant.variantId}
            onClick={() => setSelectedVariantId(variant.variantId)}
            className={`rounded border p-2 text-left text-xs ${
              selectedVariant.variantId === variant.variantId
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200"
            }`}
          >
            <p className="font-semibold">Variant {variant.variantId}</p>
            <p>Score: {variant.score.toFixed(1)}</p>
            <p>Rooms: {variant.rooms.length}</p>
          </button>
        ))}
      </div>

      {/* Export buttons */}
      <div className="flex flex-wrap gap-2">
        <Button className="rounded border border-gray-300 px-3 py-1 text-sm" onClick={exportSvg}>
          Download SVG
        </Button>
        <Button className="rounded border border-gray-300 px-3 py-1 text-sm" onClick={exportPng}>
          Download PNG
        </Button>
        <Button className="rounded border border-gray-300 px-3 py-1 text-sm" onClick={exportPdf}>
          Download PDF
        </Button>
        <Button
          className="rounded border border-blue-500 px-3 py-1 text-sm text-blue-700"
          onClick={saveToBackend}
        >
          Save To Backend
        </Button>
      </div>

      {/* SVG Canvas */}
      <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
        <div
          className="h-[600px] w-full cursor-grab"
          onMouseDown={(e) => {
            setDragging(true);
            setLastPoint({ x: e.clientX, y: e.clientY });
          }}
          onMouseMove={(e) => {
            if (!dragging) return;
            setPan((p) => ({
              x: p.x + e.clientX - lastPoint.x,
              y: p.y + e.clientY - lastPoint.y,
            }));
            setLastPoint({ x: e.clientX, y: e.clientY });
          }}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
          onWheel={(e) => {
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setScale((s) => Math.max(0.3, Math.min(4, Number((s + delta).toFixed(2)))));
          }}
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${viewW} ${viewH}`}
            className="h-full w-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: "center",
            }}
          >
            {/* Background */}
            <rect width={viewW} height={viewH} fill={COLORS.bg} />

            {/* ── Boundary dimension lines ──────────────────────── */}
            {/* Top dimension (width) */}
            <line
              x1={ox}
              y1={oy - 20}
              x2={ox + contentW}
              y2={oy - 20}
              stroke={COLORS.dimLine}
              strokeWidth={1}
            />
            <line x1={ox} y1={oy - 26} x2={ox} y2={oy - 14} stroke={COLORS.dimLine} strokeWidth={1} />
            <line
              x1={ox + contentW}
              y1={oy - 26}
              x2={ox + contentW}
              y2={oy - 14}
              stroke={COLORS.dimLine}
              strokeWidth={1}
            />
            <text
              x={ox + contentW / 2}
              y={oy - 28}
              textAnchor="middle"
              fontSize={13}
              fontWeight="bold"
              fontFamily="Arial, sans-serif"
              fill={COLORS.label}
            >
              {ftToLabel(bw)}
            </text>

            {/* Right dimension (height/depth) */}
            <line
              x1={ox + contentW + 20}
              y1={oy}
              x2={ox + contentW + 20}
              y2={oy + contentH}
              stroke={COLORS.dimLine}
              strokeWidth={1}
            />
            <line
              x1={ox + contentW + 14}
              y1={oy}
              x2={ox + contentW + 26}
              y2={oy}
              stroke={COLORS.dimLine}
              strokeWidth={1}
            />
            <line
              x1={ox + contentW + 14}
              y1={oy + contentH}
              x2={ox + contentW + 26}
              y2={oy + contentH}
              stroke={COLORS.dimLine}
              strokeWidth={1}
            />
            <text
              x={ox + contentW + 36}
              y={oy + contentH / 2}
              textAnchor="middle"
              fontSize={13}
              fontWeight="bold"
              fontFamily="Arial, sans-serif"
              fill={COLORS.label}
              transform={`rotate(90 ${ox + contentW + 36} ${oy + contentH / 2})`}
            >
              {ftToLabel(bh)}
            </text>

            {/* ── Room fills ───────────────────────────────────── */}
            {selectedVariant.rooms.map((room) => {
              const svgR = toSvgRect(room.rectFt);
              return (
                <rect
                  key={`fill-${room.id}`}
                  x={svgR.x}
                  y={svgR.y}
                  width={svgR.width}
                  height={svgR.height}
                  fill={hoverRoom === room.id ? COLORS.roomHover : COLORS.roomFill}
                  onMouseEnter={() => setHoverRoom(room.id)}
                  onMouseLeave={() => setHoverRoom(null)}
                />
              );
            })}

            {/* ── Wall segments ────────────────────────────────── */}
            {wallSegments.map((seg, i) => (
              <line
                key={`wall-${i}`}
                x1={seg.x1}
                y1={seg.y1}
                x2={seg.x2}
                y2={seg.y2}
                stroke={COLORS.wall}
                strokeWidth={seg.isOuter ? OUTER_WALL_PX : INNER_WALL_PX}
                strokeLinecap="square"
              />
            ))}

            {/* ── Windows only (no doors) ─────────────────────── */}
            {selectedVariant.openings
              .filter((o) => o.kind === "WINDOW")
              .map((o) => {
              const room = selectedVariant.rooms.find((r) => r.id === o.roomId);
              if (!room) return null;

              const svgR = toSvgRect(room.rectFt);
              const svgWall = o.wall;
              const line = wallLine(svgR, svgWall as "N" | "S" | "E" | "W");
              const isH = svgWall === "N" || svgWall === "S";

              const openingW = o.widthFt * PX_PER_FT;
              const offset = o.offsetFt * PX_PER_FT;

              let startX: number, startY: number, endX: number, endY: number;

              if (isH) {
                startX = line.x1 + offset;
                startY = line.y1;
                endX = startX + openingW;
                endY = line.y1;
              } else {
                startX = line.x1;
                startY = svgR.y + svgR.height - offset - openingW;
                endX = line.x1;
                endY = startY + openingW;
              }

              const wallThickness = OUTER_WALL_PX;
              const gap = 3;

              return (
                <g key={o.id}>
                  {/* Clear wall segment */}
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={COLORS.bg}
                    strokeWidth={wallThickness + 2}
                  />
                  {/* Three parallel window lines */}
                  {isH ? (
                    <>
                      <line x1={startX} y1={startY - gap} x2={endX} y2={endY - gap} stroke={COLORS.window} strokeWidth={1.5} />
                      <line x1={startX} y1={startY} x2={endX} y2={endY} stroke={COLORS.window} strokeWidth={0.8} />
                      <line x1={startX} y1={startY + gap} x2={endX} y2={endY + gap} stroke={COLORS.window} strokeWidth={1.5} />
                    </>
                  ) : (
                    <>
                      <line x1={startX - gap} y1={startY} x2={endX - gap} y2={endY} stroke={COLORS.window} strokeWidth={1.5} />
                      <line x1={startX} y1={startY} x2={endX} y2={endY} stroke={COLORS.window} strokeWidth={0.8} />
                      <line x1={startX + gap} y1={startY} x2={endX + gap} y2={endY} stroke={COLORS.window} strokeWidth={1.5} />
                    </>
                  )}
                </g>
              );
            })}

            {/* ── Room labels ──────────────────────────────────── */}
            {selectedVariant.rooms.map((room) => {
              const svgR = toSvgRect(room.rectFt);
              const cx = svgR.x + svgR.width / 2;
              const cy = svgR.y + svgR.height / 2;
              const roomW = room.rectFt.width;
              const roomH = room.rectFt.height;

              // Determine if label needs to be smaller for tiny rooms
              const minDim = Math.min(svgR.width, svgR.height);
              const nameSize = minDim < 80 ? 9 : minDim < 120 ? 11 : 13;
              const dimSize = minDim < 80 ? 8 : minDim < 120 ? 9 : 11;

              return (
                <g key={`label-${room.id}`}>
                  <text
                    x={cx}
                    y={cy - 6}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={nameSize}
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    fill={COLORS.label}
                  >
                    {room.name.toUpperCase()}
                  </text>
                  <text
                    x={cx}
                    y={cy + nameSize - 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={dimSize}
                    fontFamily="Arial, sans-serif"
                    fill={COLORS.dimension}
                  >
                    {ftToLabel(roomW)} X {ftToLabel(roomH)}
                  </text>
                </g>
              );
            })}

            {/* ── Compass indicator (top-right) ───────────────── */}
            <g transform={`translate(${viewW - 50}, ${30})`}>
              <text
                x={0}
                y={0}
                textAnchor="middle"
                fontSize={14}
                fontWeight="bold"
                fontFamily="Arial, sans-serif"
                fill={COLORS.label}
              >
                N
              </text>
              <line x1={0} y1={4} x2={0} y2={18} stroke={COLORS.label} strokeWidth={2} />
              <polygon points="0,4 -4,12 4,12" fill={COLORS.label} />
              <text x={0} y={30} textAnchor="middle" fontSize={8} fontFamily="Arial, sans-serif" fill={COLORS.dimension}>
                S
              </text>
              <text x={-16} y={16} textAnchor="middle" fontSize={8} fontFamily="Arial, sans-serif" fill={COLORS.dimension}>
                W
              </text>
              <text x={16} y={16} textAnchor="middle" fontSize={8} fontFamily="Arial, sans-serif" fill={COLORS.dimension}>
                E
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 ? (
        <div className="rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          {warnings.map((w, i) => (
            <p key={`${w}-${i}`}>- {w}</p>
          ))}
        </div>
      ) : null}

      <div className="text-xs text-gray-500">Zoom with mouse wheel. Drag to pan.</div>
    </div>
  );
};

export default FloorPlanSvgViewer;
