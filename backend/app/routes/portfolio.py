"""
Portfolio API routes.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.services.ai_engine import analyze_portfolio

router = APIRouter()

# In-memory portfolio state (would be DB in production)
_portfolio = [
    {"name": "BTC", "value": 45000, "sector": "Crypto"},
    {"name": "AAPL", "value": 32000, "sector": "Stocks"},
    {"name": "ETH", "value": 28000, "sector": "Crypto"},
    {"name": "NVDA", "value": 18000, "sector": "Stocks"},
    {"name": "SOL", "value": 12000, "sector": "Crypto"},
    {"name": "Cash", "value": 12832.50, "sector": "Cash"},
]


@router.get("/holdings")
async def get_holdings():
    """Get current portfolio holdings."""
    total = sum(h["value"] for h in _portfolio)
    return {
        "holdings": _portfolio,
        "totalValue": total,
        "assetCount": len(_portfolio),
    }


@router.get("/analysis")
async def get_portfolio_analysis():
    """Get AI-driven portfolio analysis and rebalancing suggestions."""
    analysis = analyze_portfolio(_portfolio)
    return analysis


class RebalanceRequest(BaseModel):
    adjustments: List[dict]  # [{name: "BTC", newValue: 40000}, ...]

@router.post("/rebalance")
async def rebalance(req: RebalanceRequest):
    """Apply rebalancing adjustments to the portfolio."""
    global _portfolio
    for adj in req.adjustments:
        for h in _portfolio:
            if h["name"] == adj.get("name"):
                h["value"] = adj.get("newValue", h["value"])
                break
    return {"message": "Portfolio rebalanced", "holdings": _portfolio}
