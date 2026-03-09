from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from solver import solve_planspec


class SolveRequest(BaseModel):
    planSpec: Dict[str, Any]
    generateVariants: int = Field(default=3, ge=1, le=10)
    seed: Optional[int] = None
    llmLayouts: Optional[List[Dict[str, Any]]] = None


app = FastAPI(title="Floorplan Solver", version="2.0.0")


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/solve")
def solve(req: SolveRequest) -> Dict[str, Any]:
    try:
        return solve_planspec(
            req.planSpec,
            req.generateVariants,
            req.seed,
            req.llmLayouts,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))
