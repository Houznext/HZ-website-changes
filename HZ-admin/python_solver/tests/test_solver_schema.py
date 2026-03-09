from solver import solve_planspec


def sample_planspec():
    return {
        "schemaVersion": "1.0.0",
        "requestHash": "abc",
        "generatedAtIso": "2026-02-17T00:00:00Z",
        "warnings": [],
        "portions": [
            {
                "floorIndex": 0,
                "floorName": "Ground Floor",
                "portionIndex": 0,
                "portionType": "2BHK",
                "boundaryFt": {"width": 20, "length": 30},
                "gateSide": "East",
                "facing": "East",
                "vastuPreference": "BALANCED",
                "tolerance": {"areaTolerancePct": 5},
                "rules": {
                    "wallThicknessFt": 0.5,
                    "minPassageWidthFt": 3,
                    "defaultDoorWidthFt": 3,
                    "bedroomDoorWidthFt": 3,
                    "bathroomDoorWidthFt": 2.5,
                    "windowWidthFt": 4,
                    "minWindowPerRoom": 1,
                },
                "staircase": {
                    "type": "DOGLEG",
                    "widthFt": 3.5,
                    "positionPreference": "NEAR_SOUTH_OR_WEST",
                },
                "rooms": [
                    {
                        "id": "living",
                        "name": "Living",
                        "type": "LIVING",
                        "minWidthFt": 10,
                        "minHeightFt": 10,
                        "targetAreaFt2": 140,
                    },
                    {
                        "id": "kitchen",
                        "name": "Kitchen",
                        "type": "KITCHEN",
                        "minWidthFt": 7,
                        "minHeightFt": 8,
                        "targetAreaFt2": 70,
                    },
                ],
                "adjacencyPreferences": [],
                "zonePreferences": [],
                "notes": [],
            }
        ],
    }


def test_solver_returns_schema():
    out = solve_planspec(sample_planspec(), generate_variants=2, seed=11)
    assert "portions" in out
    assert len(out["portions"]) == 1
    assert len(out["portions"][0]["variants"]) == 2
    variant = out["portions"][0]["variants"][0]
    assert "rooms" in variant
    assert "openings" in variant


def test_golden_structure():
    out = solve_planspec(sample_planspec(), generate_variants=1, seed=11)
    variant = out["portions"][0]["variants"][0]
    first_room = variant["rooms"][0]
    assert set(["id", "name", "type", "rectFt", "areaFt2", "label"]).issubset(first_room.keys())
