import sys
import os
import json
import pytest

# Add the parent directory to sys.path to import solver
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from solver import cp_sat_layout, InfeasibleError

def test_basic_2bhk_realism():
    portion = {
        "floorIndex": 0,
        "floorName": "Ground Floor",
        "portionIndex": 0,
        "portionType": "2BHK",
        "boundaryFt": {"width": 30.0, "length": 40.0},
        "gateSide": "SOUTH",
        "facing": "EAST",
        "vastuPreference": "BALANCED",
        "tolerance": {"areaTolerancePct": 10.0},
        "rules": {
            "wallThicknessFt": 0.5,
            "minPassageWidthFt": 3.0,
            "defaultDoorWidthFt": 3.0,
            "bedroomDoorWidthFt": 3.0,
            "bathroomDoorWidthFt": 2.5,
            "windowWidthFt": 4.0,
            "minWindowPerRoom": 1
        },
        "staircase": {"type": "DOGLEG", "widthFt": 6.0, "positionPreference": "ANY"},
        "rooms": [
            {"id": "living", "name": "Living Room", "type": "LIVING", "minWidthFt": 10, "minHeightFt": 12, "targetAreaFt2": 180},
            {"id": "dining", "name": "Dining", "type": "DINING", "minWidthFt": 8, "minHeightFt": 8, "targetAreaFt2": 100},
            {"id": "kitchen", "name": "Kitchen", "type": "KITCHEN", "minWidthFt": 7, "minHeightFt": 9, "targetAreaFt2": 80},
            {"id": "bedroom_1", "name": "Master Bedroom", "type": "BEDROOM", "minWidthFt": 10, "minHeightFt": 11, "targetAreaFt2": 130},
            {"id": "bedroom_2", "name": "Common Bedroom", "type": "BEDROOM", "minWidthFt": 10, "minHeightFt": 10, "targetAreaFt2": 110},
            {"id": "bathroom_1", "name": "Attached Toilet", "type": "BATHROOM", "minWidthFt": 4.5, "minHeightFt": 7, "targetAreaFt2": 35},
            {"id": "bathroom_2", "name": "Common Toilet", "type": "BATHROOM", "minWidthFt": 4.5, "minHeightFt": 7, "targetAreaFt2": 35},
        ],
        "adjacencyPreferences": [
            {"from": "living", "to": "dining", "strength": "HARD", "weight": 10},
            {"from": "dining", "to": "kitchen", "strength": "HARD", "weight": 10},
        ],
        "zonePreferences": []
    }

    placed, warnings, scores, footprint = cp_sat_layout(portion, 42, 10.0)

    assert len(placed) > 0, "No rooms were placed"
    
    # Check for overlaps (using a simple rectangle check)
    def intersects(r1, r2):
        return not (r1['x'] + r1['width'] <= r2['x'] or
                    r2['x'] + r2['width'] <= r1['x'] or
                    r1['y'] + r1['height'] <= r2['y'] or
                    r2['y'] + r2['height'] <= r1['y'])

    for i, r1 in enumerate(placed):
        rect1 = r1['rectFt']
        # Boundary check
        assert rect1['x'] >= 0
        assert rect1['y'] >= 0
        assert rect1['x'] + rect1['width'] <= portion['boundaryFt']['width'] + 0.01
        assert rect1['y'] + rect1['height'] <= portion['boundaryFt']['length'] + 0.01
        
        for j, r2 in enumerate(placed):
            if i == j: continue
            rect2 = r2['rectFt']
            assert not intersects(rect1, rect2), f"Rooms {r1['id']} and {r2['id']} overlap"

    print("Test passed: All rooms within boundary and no overlaps found.")
    print(f"Vastu Score: {scores['vastuScore']}")
    print(f"Total Score: {scores['totalScore']}")

def test_minimal_realism():
    """Test with only 2 rooms to isolate infeasibility."""
    print("\nRunning minimal realism test...")
    portion = {
        "id": "minimal",
        "boundaryFt": {"width": 20.0, "length": 20.0},
        "rooms": [
            {"id": "r1", "type": "BEDROOM", "targetAreaFt2": 80, "minWidthFt": 8, "minHeightFt": 8},
            {"id": "r2", "type": "BEDROOM", "targetAreaFt2": 80, "minWidthFt": 8, "minHeightFt": 8},
        ],
        "rules": {"wallThicknessFt": 0.0},
        "adjacencyPreferences": []
    }
    try:
        placed, warnings, scores, footprint = cp_sat_layout(portion, 42, 10.0)
        print("Success! Placed rooms:", [r["id"] for r in placed])
    except InfeasibleError as e:
        print(f"Minimal test FAILED: {e}")

if __name__ == "__main__":
    test_minimal_realism()
    test_basic_2bhk_realism()
