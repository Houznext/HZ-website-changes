"""
Floor Plan Solver v3 — Hybrid LLM + Deterministic layout engine.

The LLM provides a grid-based layout (rows of rooms with percentage-based sizing).
This solver converts that into exact pixel-perfect coordinates with 100% area coverage.

If no LLM layout is provided, falls back to a deterministic strip-packing algorithm.

Indian floor plan rules:
1. No empty/dead space — every square foot is allocated
2. Adjacent rooms share exactly one wall
3. Bathrooms attached to bedrooms
4. Kitchen adjacent to living/dining
5. Bedrooms in private zone away from entrance
"""

from __future__ import annotations

import math
import random
import time
import uuid
from typing import Any, Dict, List, Optional, Tuple


# ── Room dimension constraints (feet) ──────────────────────────────────────
ROOM_CONSTRAINTS = {
    "BEDROOM":   {"min_w": 9,  "min_h": 9,  "max_aspect": 2.0},
    "BATHROOM":  {"min_w": 4,  "min_h": 5,  "max_aspect": 2.5},
    "WC":        {"min_w": 3,  "min_h": 4,  "max_aspect": 2.5},
    "LIVING":    {"min_w": 10, "min_h": 10, "max_aspect": 2.5},
    "KITCHEN":   {"min_w": 6,  "min_h": 7,  "max_aspect": 2.5},
    "DINING":    {"min_w": 7,  "min_h": 7,  "max_aspect": 2.0},
    "POOJA":     {"min_w": 3,  "min_h": 3,  "max_aspect": 2.0},
    "BALCONY":   {"min_w": 3,  "min_h": 4,  "max_aspect": 4.0},
    "STAIRCASE": {"min_w": 3,  "min_h": 8,  "max_aspect": 3.0},
    "OTHER":     {"min_w": 4,  "min_h": 4,  "max_aspect": 3.0},
    "GUEST_ROOM":{"min_w": 8,  "min_h": 8,  "max_aspect": 2.0},
    "RESERVED":  {"min_w": 3,  "min_h": 3,  "max_aspect": 3.0},
}

WINDOW_WIDTH_FT = 3.0


# ── Helpers ─────────────────────────────────────────────────────────────────

def _norm_dir(direction: str) -> str:
    d = (direction or "").upper().strip()
    if "NORTH" in d or d == "N":
        return "N"
    if "SOUTH" in d or d == "S":
        return "S"
    if "EAST" in d or d == "E":
        return "E"
    if "WEST" in d or d == "W":
        return "W"
    return "N"


def _room_type(room: Dict) -> str:
    return str(room.get("type", "OTHER")).upper()


def _room_id(room: Dict) -> str:
    return str(room.get("roomId", room.get("id", "")))


def _room_label(room: Dict) -> str:
    return str(room.get("label", room.get("name", _room_id(room))))


def _is_bedroom(room: Dict) -> bool:
    rt = _room_type(room)
    rid = _room_id(room).lower()
    return rt == "BEDROOM" or "bedroom" in rid or "master" in rid


def _is_bathroom(room: Dict) -> bool:
    rt = _room_type(room)
    rid = _room_id(room).lower()
    return rt in ("BATHROOM", "WC") or "bath" in rid or rid.startswith("wc")


def _is_living(room: Dict) -> bool:
    rt = _room_type(room)
    rid = _room_id(room).lower()
    return rt == "LIVING" or "living" in rid


def _is_kitchen(room: Dict) -> bool:
    rt = _room_type(room)
    rid = _room_id(room).lower()
    return rt == "KITCHEN" or ("kitchen" in rid and rt != "OTHER")


def _target_area(room: Dict) -> float:
    return max(1.0, float(room.get("targetAreaFt2", 50)))


# ── LLM Grid Layout → Exact Coordinates ───────────────────────────────────

def _execute_llm_layout(
    layout: Dict,
    room_map: Dict[str, Dict],
    plot_w: float,
    plot_d: float,
) -> List[Dict]:
    """Convert an LLM grid layout (rows with percentage-based sizing) into
    exact room coordinates that perfectly fill the plot boundary."""

    rows = layout.get("rows", [])
    if not rows:
        return []

    # Normalize depthPct to sum to exactly 100
    total_depth_pct = sum(r.get("depthPct", 0) for r in rows)
    if total_depth_pct <= 0:
        return []

    placed = []
    y_cursor = 0.0  # Start from y=0 (south/bottom)

    for row_idx, row in enumerate(rows):
        depth_pct = row.get("depthPct", 0) * (100.0 / total_depth_pct)
        cells = row.get("cells", [])
        if not cells:
            continue

        # Calculate row depth
        if row_idx == len(rows) - 1:
            # Last row snaps to fill remaining space
            row_depth = round(plot_d - y_cursor, 2)
        else:
            row_depth = round(plot_d * depth_pct / 100.0, 2)

        if row_depth < 1:
            row_depth = 1.0

        # Normalize widthPct within this row
        total_w_pct = sum(c.get("widthPct", 0) for c in cells)
        if total_w_pct <= 0:
            for c in cells:
                c["widthPct"] = 100.0 / len(cells)
            total_w_pct = 100.0

        x_cursor = 0.0
        for cell_idx, cell in enumerate(cells):
            room_id = cell.get("roomId", "")
            room_info = room_map.get(room_id, {})
            w_pct = cell.get("widthPct", 0) * (100.0 / total_w_pct)

            # Calculate width
            if cell_idx == len(cells) - 1:
                # Last cell snaps to fill remaining width
                cell_width = round(plot_w - x_cursor, 2)
            else:
                cell_width = round(plot_w * w_pct / 100.0, 2)

            if cell_width < 1:
                cell_width = 1.0

            placed.append({
                "id": room_id,
                "name": _room_label(room_info) if room_info else room_id,
                "type": _room_type(room_info) if room_info else "OTHER",
                "rectFt": {
                    "x": round(x_cursor, 2),
                    "y": round(y_cursor, 2),
                    "width": cell_width,
                    "height": row_depth,
                },
                "areaFt2": round(cell_width * row_depth, 2),
                "label": _room_label(room_info) if room_info else room_id,
            })

            x_cursor = round(x_cursor + cell_width, 2)

        y_cursor = round(y_cursor + row_depth, 2)

    return placed


# ── Fallback: Deterministic strip-packing ──────────────────────────────────

def _classify_rooms(rooms: List[Dict]) -> Dict[str, List[Dict]]:
    classified: Dict[str, List[Dict]] = {
        "bedrooms": [],
        "bathrooms": [],
        "living": [],
        "kitchen": [],
        "dining": [],
        "other": [],
    }

    has_kitchen = False
    for room in rooms:
        rt = _room_type(room)
        rid = _room_id(room).lower()

        if _is_bedroom(room):
            classified["bedrooms"].append(room)
        elif _is_bathroom(room):
            classified["bathrooms"].append(room)
        elif _is_living(room):
            classified["living"].append(room)
        elif rt == "KITCHEN":
            classified["kitchen"].append(room)
            has_kitchen = True
        elif rt == "DINING" or "dining" in rid:
            classified["dining"].append(room)
        elif "kitchen" in rid and rt == "OTHER":
            if has_kitchen:
                room = dict(room)
                room["label"] = "Utility"
                room["type"] = "OTHER"
                classified["other"].append(room)
            else:
                room = dict(room)
                room["type"] = "KITCHEN"
                classified["kitchen"].append(room)
                has_kitchen = True
        else:
            classified["other"].append(room)

    classified["bedrooms"].sort(key=lambda r: _room_id(r))
    classified["bathrooms"].sort(key=lambda r: _room_id(r))

    return classified


def _place_rooms_in_strip(
    rooms: List[Dict],
    strip_width: float,
    strip_depth: float,
    x_offset: float = 0.0,
    y_offset: float = 0.0,
) -> List[Dict]:
    if not rooms:
        return []

    total_target = sum(_target_area(r) for r in rooms)
    widths: List[float] = []

    for room in rooms:
        proportion = _target_area(room) / total_target if total_target > 0 else 1 / len(rooms)
        w = max(4.0, round(strip_width * proportion, 2))
        widths.append(w)

    total_assigned = sum(widths[:-1])
    widths[-1] = round(strip_width - total_assigned, 2)

    placed = []
    x = x_offset
    for i, room in enumerate(rooms):
        w = round(widths[i], 2)
        placed.append({
            "id": _room_id(room),
            "name": _room_label(room),
            "type": _room_type(room),
            "rectFt": {
                "x": round(x, 2),
                "y": round(y_offset, 2),
                "width": w,
                "height": round(strip_depth, 2),
            },
            "areaFt2": round(w * strip_depth, 2),
            "label": _room_label(room),
        })
        x = round(x + w, 2)

    return placed


def _generate_fallback_layout(
    rooms: List[Dict],
    plot_w: float,
    plot_d: float,
    gate_dir: str,
    variant_type: int = 0,
) -> List[Dict]:
    """Deterministic strip-packing fallback when LLM is unavailable."""
    classified = _classify_rooms(rooms)

    bedrooms = classified["bedrooms"]
    bathrooms = classified["bathrooms"]
    living = classified["living"]
    kitchen = classified["kitchen"]
    dining = classified["dining"]
    other = classified["other"]

    # Private zone: bedrooms + their attached bathrooms
    private_rooms: List[Dict] = []
    for i, bed in enumerate(bedrooms):
        if i < len(bathrooms):
            if variant_type % 2 == 0:
                private_rooms.append(bathrooms[i])
                private_rooms.append(bed)
            else:
                private_rooms.append(bed)
                private_rooms.append(bathrooms[i])
        else:
            private_rooms.append(bed)

    # Any remaining bathrooms
    for i in range(len(bedrooms), len(bathrooms)):
        private_rooms.append(bathrooms[i])

    # Public zone: living + kitchen + dining + others
    public_rooms = kitchen + living + dining + other

    if not public_rooms and not private_rooms:
        return []

    # Zone depths based on area proportions
    total_private_area = sum(_target_area(r) for r in private_rooms) if private_rooms else 0
    total_public_area = sum(_target_area(r) for r in public_rooms) if public_rooms else 0
    total_area = total_private_area + total_public_area

    if total_area == 0:
        private_depth = plot_d / 2
    elif not public_rooms:
        private_depth = plot_d
    elif not private_rooms:
        private_depth = 0
    else:
        private_ratio = total_private_area / total_area
        private_depth = round(max(9, min(plot_d - 8, plot_d * private_ratio)), 2)

    public_depth = round(plot_d - private_depth, 2)

    placed = []
    if private_rooms:
        placed.extend(_place_rooms_in_strip(private_rooms, plot_w, private_depth, 0, 0))
    if public_rooms:
        placed.extend(_place_rooms_in_strip(public_rooms, plot_w, public_depth, 0, private_depth))

    return placed


# ── Window placement ───────────────────────────────────────────────────────

def _build_windows(
    rooms: List[Dict],
    plot_w: float,
    plot_d: float,
) -> List[Dict]:
    """Place windows on external walls only."""
    openings: List[Dict] = []
    eps = 0.01

    for room in rooms:
        rect = room["rectFt"]
        rx, ry = rect["x"], rect["y"]
        rw, rh = rect["width"], rect["height"]
        room_id = room["id"]

        # Find external walls
        external_walls = []
        if abs(rx) < eps:
            external_walls.append("W")
        if abs(rx + rw - plot_w) < eps:
            external_walls.append("E")
        if abs(ry) < eps:
            external_walls.append("S")
        if abs(ry + rh - plot_d) < eps:
            external_walls.append("N")

        if not external_walls:
            continue

        # Pick best wall (prefer longer wall for larger window)
        wall = external_walls[0]
        for w in external_walls:
            if w in ("N", "S") and rw > rh:
                wall = w
                break
            if w in ("E", "W") and rh > rw:
                wall = w
                break

        wall_len = rw if wall in ("N", "S") else rh
        win_w = min(WINDOW_WIDTH_FT, wall_len - 1)
        if win_w < 1.5:
            continue

        offset = round((wall_len - win_w) / 2, 2)

        openings.append({
            "id": f"window_{room_id}_{wall}",
            "roomId": room_id,
            "wall": wall,
            "offsetFt": offset,
            "widthFt": round(win_w, 2),
            "kind": "WINDOW",
        })

    return openings


# ── Score a layout ─────────────────────────────────────────────────────────

def _score_layout(rooms: List[Dict], plot_w: float, plot_d: float) -> Tuple[float, Dict[str, float]]:
    total_area = sum(r["rectFt"]["width"] * r["rectFt"]["height"] for r in rooms)
    plot_area = plot_w * plot_d
    coverage = min(1.0, total_area / plot_area) if plot_area > 0 else 0

    aspect_scores = []
    for r in rooms:
        w, h = r["rectFt"]["width"], r["rectFt"]["height"]
        ratio = max(w, h) / min(w, h) if min(w, h) > 0 else 10
        aspect_scores.append(max(0, 1 - (ratio - 1) / 3))
    avg_aspect = sum(aspect_scores) / len(aspect_scores) if aspect_scores else 0

    score = coverage * 0.5 + avg_aspect * 0.5
    breakdown = {
        "coverage": round(coverage, 3),
        "aspectRatio": round(avg_aspect, 3),
    }

    return round(score, 3), breakdown


# ── Solve a single portion ─────────────────────────────────────────────────

def _solve_portion(
    portion: Dict,
    llm_layouts: Optional[List[Dict]],
    num_variants: int,
    seed: Optional[int],
) -> Dict:
    """Solve a single portion, using LLM layouts if available."""
    boundary = portion.get("boundaryFt", {})
    plot_w = float(boundary.get("width", 30))
    plot_d = float(boundary.get("length", 24))
    rooms = portion.get("rooms", [])
    gate_dir = _norm_dir(portion.get("gateSide", portion.get("gatePosition", "NORTH")))
    wall_t = float(portion.get("rules", {}).get("wallThicknessFt",
                   portion.get("constructionRules", {}).get("wallThicknessFt", 0.375)))

    # Build room lookup map
    room_map: Dict[str, Dict] = {}
    for r in rooms:
        rid = _room_id(r)
        if rid:
            room_map[rid] = r

    variants = []

    if llm_layouts and len(llm_layouts) > 0:
        # Use LLM-provided layouts
        for i, layout in enumerate(llm_layouts[:num_variants]):
            placed = _execute_llm_layout(layout, room_map, plot_w, plot_d)
            if not placed:
                continue

            windows = _build_windows(placed, plot_w, plot_d)
            score, breakdown = _score_layout(placed, plot_w, plot_d)

            variants.append({
                "variantId": f"llm_v{i+1}_{uuid.uuid4().hex[:6]}",
                "score": score,
                "scoreBreakdown": breakdown,
                "warnings": [],
                "boundaryFt": {"width": plot_w, "length": plot_d},
                "wallThicknessFt": wall_t,
                "rooms": placed,
                "openings": windows,
            })

    if not variants:
        # Fallback to deterministic layouts
        for vtype in range(min(num_variants, 3)):
            placed = _generate_fallback_layout(rooms, plot_w, plot_d, gate_dir, vtype)
            if not placed:
                continue

            windows = _build_windows(placed, plot_w, plot_d)
            score, breakdown = _score_layout(placed, plot_w, plot_d)

            variants.append({
                "variantId": f"det_v{vtype+1}_{uuid.uuid4().hex[:6]}",
                "score": score,
                "scoreBreakdown": breakdown,
                "warnings": ["Deterministic fallback layout (LLM unavailable)"],
                "boundaryFt": {"width": plot_w, "length": plot_d},
                "wallThicknessFt": wall_t,
                "rooms": placed,
                "openings": windows,
            })

    # Sort by score descending
    variants.sort(key=lambda v: v["score"], reverse=True)

    return {
        "floorIndex": portion.get("floorIndex", 0),
        "floorName": portion.get("floorName", "Ground Floor"),
        "portionIndex": portion.get("portionIndex", 0),
        "portionType": portion.get("portionType", ""),
        "variants": variants,
    }


# ── Main entry point ───────────────────────────────────────────────────────

def solve_planspec(
    plan_spec: Dict[str, Any],
    generate_variants: int = 3,
    seed: Optional[int] = None,
    llm_layouts: Optional[List[Dict]] = None,
) -> Dict[str, Any]:
    """Solve all portions in a PlanSpec and return a PlacedPlan.

    Args:
        plan_spec: The PlanSpec with portions to solve.
        generate_variants: Number of variants to generate per portion.
        seed: Optional random seed.
        llm_layouts: Optional list of LLM layout grids (one per variant).
    """
    portions = plan_spec.get("portions", [])

    if not portions:
        return {
            "schemaVersion": "1.0.0",
            "createdAtIso": "",
            "planId": "",
            "requestHash": plan_spec.get("requestHash", ""),
            "warnings": ["No portions provided"],
            "portions": [],
        }

    placed_portions = []
    all_warnings = list(plan_spec.get("warnings", []))

    for portion in portions:
        placed = _solve_portion(
            portion,
            llm_layouts,
            max(1, min(10, generate_variants)),
            seed,
        )
        placed_portions.append(placed)

    return {
        "schemaVersion": plan_spec.get("schemaVersion", "1.0.0"),
        "createdAtIso": plan_spec.get("generatedAtIso", ""),
        "planId": "",
        "requestHash": plan_spec.get("requestHash", ""),
        "warnings": all_warnings,
        "portions": placed_portions,
    }
