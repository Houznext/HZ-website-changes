
import json
import sys
import os

# Add the directory containing solver.py to sys.path
sys.path.append('/Users/sayyadazeem/Desktop/Work/Onecasa/dreamcasaAdmin/python_solver')

from solver import solve_planspec

# The input provided by the user (roughly mapped to planSpec)
# Note: SummaryDetails/index.tsx expands this before sending.
# I will simulate the expanded planSpec based on what I saw in program-expander.ts

plan_spec = {
    "schemaVersion": "1.0.0",
    "generatedAtIso": "2024-02-23T10:00:00Z",
    "portions": [
        {
            "floorIndex": 0,
            "floorName": "Ground Floor",
            "portionIndex": 0,
            "portionType": "2BHK",
            "boundaryFt": {"width": 20.0, "length": 30.0},
            "gateSide": "north",
            "facing": "north",
            "vastuPreference": "BALANCED",
            "tolerance": {"areaTolerancePct": 5},
            "rules": {
                "wallThicknessFt": 0.5,
                "defaultDoorWidthFt": 3.0,
                "bathroomDoorWidthFt": 2.5,
                "windowWidthFt": 4.0
            },
            "rooms": [
                {"id": "living", "name": "Living", "type": "LIVING", "minWidthFt": 10, "minHeightFt": 10, "targetAreaFt2": 140},
                {"id": "kitchen", "name": "Kitchen", "type": "KITCHEN", "minWidthFt": 6, "minHeightFt": 8, "targetAreaFt2": 70},
                {"id": "dining", "name": "Dining", "type": "DINING", "minWidthFt": 6, "minHeightFt": 6, "targetAreaFt2": 70, "optional": True},
                {"id": "bedroom_1", "name": "Master Bedroom", "type": "BEDROOM", "minWidthFt": 9, "minHeightFt": 9, "targetAreaFt2": 120},
                {"id": "bedroom_2", "name": "Common Bedroom", "type": "BEDROOM", "minWidthFt": 9, "minHeightFt": 9, "targetAreaFt2": 120},
                {"id": "bathroom_1", "name": "Bathroom 1", "type": "BATHROOM", "minWidthFt": 3, "minHeightFt": 6, "targetAreaFt2": 35},
                {"id": "bathroom_2", "name": "Bathroom 2", "type": "BATHROOM", "minWidthFt": 3, "minHeightFt": 6, "targetAreaFt2": 35}
            ],
            "adjacencyPreferences": [
                {"from": "living", "to": "kitchen", "strength": "SOFT", "weight": 6},
                {"from": "living", "to": "dining", "strength": "SOFT", "weight": 5},
                {"from": "bedroom_1", "to": "bathroom_1", "strength": "SOFT", "weight": 5},
                {"from": "living", "to": "bedroom_1", "strength": "SOFT", "weight": 7}
            ],
            "zonePreferences": [
                {"roomType": "KITCHEN", "preferredZones": ["SE", "NW"], "weight": 10},
                {"roomType": "BEDROOM", "preferredZones": ["SW"], "weight": 8},
                {"roomType": "POOJA", "preferredZones": ["NE"], "weight": 8},
                {"roomType": "BATHROOM", "preferredZones": ["NW", "SE"], "forbiddenZones": ["NE"], "weight": 9}
            ]
        }
    ]
}

result = solve_planspec(plan_spec, generate_variants=1, seed=7)

print(json.dumps(result, indent=2))
