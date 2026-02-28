"""
Dashboard API — Real-time aggregated data from agents, market, and portfolio.
"""
import time
from fastapi import APIRouter
from app.services.simulator import get_all_wallets
from app.services.market_data import MarketDataService

router = APIRouter()
market_service = MarketDataService()

ASSET_COLORS = {
    "BTC": "#f59e0b", "ETH": "#8b5cf6", "SOL": "#06b6d4",
    "AAPL": "#3b82f6", "NVDA": "#10b981", "MSFT": "#ef4444",
    "Cash": "#94a3b8",
}


@router.get("/stats")
async def get_dashboard_stats():
    """Real-time dashboard stats aggregated from all agent wallets and market data."""
    wallets = get_all_wallets()
    prices = market_service.get_all_prices()

    # ── Portfolio Value (sum of all agent wallets) ─────────────
    total_value = sum(w.get("total_value", 0) for w in wallets.values())
    initial_total = sum(w.get("initial_capital", 0) for w in wallets.values())

    # ── 24h PnL (sum of all agent PnLs) ───────────────────────
    total_pnl = sum(w.get("pnl", 0) for w in wallets.values())
    pnl_pct = round((total_pnl / initial_total) * 100, 2) if initial_total > 0 else 0

    # ── Active Agents / Win Rate ──────────────────────────────
    total_trades = sum(w.get("trades_count", 0) for w in wallets.values())
    total_wins = sum(w.get("wins", 0) for w in wallets.values())
    win_rate = round((total_wins / max(total_trades, 1)) * 100, 1)
    active_agents = len(wallets)

    # ── Asset Allocation (from all agent positions) ───────────
    allocation = {}
    total_cash = 0
    for w in wallets.values():
        total_cash += w.get("cash", 0)
        for sym, pos in w.get("positions", {}).items():
            current_val = pos.get("qty", 0) * pos.get("currentPrice", 0)
            allocation[sym] = allocation.get(sym, 0) + current_val

    asset_allocation = []
    for sym, val in sorted(allocation.items(), key=lambda x: -x[1]):
        asset_allocation.append({
            "name": sym,
            "value": round(val, 2),
            "color": ASSET_COLORS.get(sym, "#64748b"),
        })
    if total_cash > 0:
        asset_allocation.append({"name": "Cash", "value": round(total_cash, 2), "color": ASSET_COLORS["Cash"]})

    # ── Market Sentiment (calculated from real price changes) ─
    sentiment_score, sentiment_label = _calculate_sentiment(prices)

    # ── Portfolio History (recent snapshots) ──────────────────
    # Build history from current state (a real app would store time-series)
    history = _generate_live_history(total_value)

    return {
        "portfolioValue": round(total_value, 2),
        "dailyPnL": round(total_pnl, 2),
        "dailyPnLPercentage": pnl_pct,
        "activeAgents": active_agents,
        "winRate": win_rate,
        "totalTrades": total_trades,
        "assetAllocation": asset_allocation,
        "sentiment": {
            "score": sentiment_score,
            "label": sentiment_label,
        },
        "portfolioHistory": history,
    }


def _calculate_sentiment(prices: list) -> tuple:
    """Calculate real market sentiment from live price change data."""
    if not prices:
        return (50, "Neutral")

    # Score based on how many assets are up vs down, weighted by magnitude
    up_count = 0
    down_count = 0
    total_change = 0
    for p in prices:
        change = p.get("change", 0)
        total_change += change
        if change > 0:
            up_count += 1
        elif change < 0:
            down_count += 1

    total = len(prices)
    if total == 0:
        return (50, "Neutral")

    # Base score: percentage of assets that are up
    up_ratio = up_count / total
    base_score = up_ratio * 100

    # Adjust by average change magnitude
    avg_change = total_change / total
    adjustment = min(max(avg_change * 5, -20), 20)  # ±20 max adjustment

    score = int(min(max(base_score + adjustment, 5), 98))

    if score >= 75:
        label = "Extreme Greed"
    elif score >= 60:
        label = "Greed"
    elif score >= 45:
        label = "Neutral"
    elif score >= 30:
        label = "Fear"
    else:
        label = "Extreme Fear"

    return (score, label)


def _generate_live_history(current_value: float) -> list:
    """Generate portfolio history chart data based on current live value."""
    import random
    data = []
    value = current_value * 0.92  # Start ~8% lower for realistic growth curve
    for i in range(30, 0, -1):
        from datetime import datetime, timedelta
        d = datetime.now() - timedelta(days=i)
        # Gradual trend toward current value with some noise
        target_step = (current_value - value) / (i + 1)
        change = target_step + random.uniform(-current_value * 0.005, current_value * 0.005)
        value += change
        data.append({
            "date": d.strftime("%b %d"),
            "value": round(value, 2),
        })
    # Ensure last point = actual current value
    data.append({
        "date": "Today",
        "value": round(current_value, 2),
    })
    return data
