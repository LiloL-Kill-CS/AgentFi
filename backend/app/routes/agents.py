"""
AI Agents API routes — manages trading bot configurations + simulation wallets.
"""
import time
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.simulator import get_wallet, get_all_wallets, get_trade_history, initialize_agent_wallet

router = APIRouter()

# Agent configs (simulation wallets are managed by simulator.py)
_agents = [
    {
        "id": 1,
        "name": "Alpha Momentum",
        "strategy": "Trend Following",
        "asset": "Crypto (BTC/ETH)",
        "status": "active",
        "capital": 25000,
    },
    {
        "id": 2,
        "name": "Tech Breakout",
        "strategy": "Volatility Breakout",
        "asset": "Stocks (AAPL/NVDA/MSFT)",
        "status": "active",
        "capital": 30000,
    },
    {
        "id": 3,
        "name": "Stable Yield",
        "strategy": "Mean Reversion",
        "asset": "Crypto (BTC/ETH)",
        "status": "active",
        "capital": 15000,
    },
    {
        "id": 4,
        "name": "Altcoin Scalper",
        "strategy": "High Frequency",
        "asset": "Crypto (SOL/AVAX/MATIC)",
        "status": "active",
        "capital": 10000,
    },
]

_next_id = 5


@router.get("/")
async def list_agents():
    """List all agents enriched with live simulation data."""
    enriched = []
    all_wallets = get_all_wallets()
    for agent in _agents:
        wallet = all_wallets.get(agent["id"], {})
        enriched.append({
            **agent,
            "wallet": {
                "initialCapital": wallet.get("initial_capital", agent["capital"]),
                "cash": round(wallet.get("cash", agent["capital"]), 2),
                "totalValue": wallet.get("total_value", agent["capital"]),
                "pnl": wallet.get("pnl", 0),
                "pnlPct": wallet.get("pnl_pct", 0),
                "tradesCount": wallet.get("trades_count", 0),
                "wins": wallet.get("wins", 0),
                "losses": wallet.get("losses", 0),
                "winRate": round(
                    (wallet.get("wins", 0) / max(wallet.get("trades_count", 1), 1)) * 100, 1
                ),
                "positions": {
                    sym: {
                        "qty": round(p["qty"], 6),
                        "avgEntry": round(p["avgEntry"], 2),
                        "currentPrice": round(p["currentPrice"], 2),
                        "unrealizedPnl": round((p["currentPrice"] - p["avgEntry"]) * p["qty"], 2),
                    }
                    for sym, p in wallet.get("positions", {}).items()
                },
                "lastTrade": wallet.get("last_trade"),
            },
            "runtime": _format_runtime(wallet.get("started_at", time.time())),
        })
    return {"agents": enriched, "count": len(enriched)}


@router.get("/{agent_id}")
async def get_agent(agent_id: int):
    """Get detailed agent info with wallet and trade history."""
    agent = next((a for a in _agents if a["id"] == agent_id), None)
    if not agent:
        return {"error": "Agent not found"}
    wallet = get_wallet(agent_id)
    history = get_trade_history(agent_id)
    return {
        **agent,
        "wallet": wallet,
        "tradeHistory": history[-20:],  # last 20 trades
    }


class CreateAgentRequest(BaseModel):
    name: str
    strategy: str
    asset: str
    capital: float

@router.post("/create")
async def create_agent(req: CreateAgentRequest):
    """Deploy a new AI trading agent with virtual funds."""
    global _next_id
    new_agent = {
        "id": _next_id,
        "name": req.name,
        "strategy": req.strategy,
        "asset": req.asset,
        "status": "active",
        "capital": req.capital,
    }
    _agents.append(new_agent)
    initialize_agent_wallet(_next_id, req.capital, req.strategy, req.asset)
    _next_id += 1
    return {"message": f"Agent '{req.name}' deployed with ${req.capital:,.2f} virtual funds", "agent": new_agent}


@router.post("/{agent_id}/toggle")
async def toggle_agent(agent_id: int):
    """Pause or resume an agent."""
    agent = next((a for a in _agents if a["id"] == agent_id), None)
    if not agent:
        return {"error": "Agent not found"}
    agent["status"] = "paused" if agent["status"] == "active" else "active"
    return {"message": f"Agent '{agent['name']}' is now {agent['status']}", "agent": agent}


def _format_runtime(started_at: float) -> str:
    elapsed = time.time() - started_at
    if elapsed < 60:
        return f"{int(elapsed)}s"
    elif elapsed < 3600:
        return f"{int(elapsed/60)}m"
    elif elapsed < 86400:
        return f"{int(elapsed/3600)}h {int((elapsed%3600)/60)}m"
    else:
        return f"{int(elapsed/86400)}d {int((elapsed%86400)/3600)}h"
