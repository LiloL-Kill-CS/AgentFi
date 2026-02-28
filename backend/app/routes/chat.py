"""
AI Chat API — Contextual financial assistant powered by LIVE agent data.
Pulls real-time positions, trades, and PnL directly from the trading simulation.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.market_data import MarketDataService
from app.services.ai_engine import generate_signal
from app.services.simulator import get_all_wallets, get_trade_history

router = APIRouter()
service = MarketDataService()


class ChatMessage(BaseModel):
    message: str


def _get_live_portfolio():
    """Build portfolio from actual agent positions and cash."""
    wallets = get_all_wallets()
    holdings = {}
    total_cash = 0
    for w in wallets.values():
        total_cash += w.get("cash", 0)
        for sym, pos in w.get("positions", {}).items():
            val = pos.get("qty", 0) * pos.get("currentPrice", 0)
            holdings[sym] = holdings.get(sym, 0) + val
    portfolio = [{"name": sym, "value": round(val, 2)} for sym, val in holdings.items()]
    portfolio.append({"name": "Cash", "value": round(total_cash, 2)})
    return portfolio


def _get_agent_summary():
    """Build a text summary of what all agents are doing right now."""
    wallets = get_all_wallets()
    if not wallets:
        return None

    agent_names = {1: "Alpha Momentum", 2: "Tech Breakout", 3: "Stable Yield", 4: "Altcoin Scalper"}
    summaries = []
    for agent_id, w in wallets.items():
        name = agent_names.get(agent_id, f"Agent #{agent_id}")
        pnl = w.get("pnl", 0)
        pnl_pct = w.get("pnl_pct", 0)
        trades = w.get("trades_count", 0)
        wins = w.get("wins", 0)
        losses = w.get("losses", 0)
        win_rate = round((wins / max(trades, 1)) * 100, 1)
        strategy = w.get("strategy", "Unknown")
        total_val = w.get("total_value", 0)

        positions = []
        for sym, pos in w.get("positions", {}).items():
            unrealized = round((pos["currentPrice"] - pos["avgEntry"]) * pos["qty"], 2)
            positions.append(f"{sym} ({'+' if unrealized >= 0 else ''}{unrealized:.2f})")

        pos_text = ", ".join(positions) if positions else "No open positions"
        summaries.append({
            "name": name,
            "strategy": strategy,
            "totalValue": round(total_val, 2),
            "pnl": round(pnl, 2),
            "pnlPct": pnl_pct,
            "trades": trades,
            "winRate": win_rate,
            "wins": wins,
            "losses": losses,
            "positions": pos_text,
            "positionsList": list(w.get("positions", {}).keys()),
        })
    return summaries


def _get_recent_trades_summary(agent_id=None):
    """Get the last N trades across all agents."""
    all_trades = []
    agent_names = {1: "Alpha Momentum", 2: "Tech Breakout", 3: "Stable Yield", 4: "Altcoin Scalper"}
    wallets = get_all_wallets()

    for aid in wallets.keys():
        if agent_id and aid != agent_id:
            continue
        history = get_trade_history(aid)
        for t in history[-5:]:
            if t.get("success"):
                all_trades.append({
                    "agent": agent_names.get(aid, f"Agent #{aid}"),
                    "action": t["action"],
                    "symbol": t["symbol"],
                    "qty": round(t["qty"], 4),
                    "price": t["price"],
                    "value": t["value"],
                    "pnl": t.get("pnl"),
                    "timestamp": t["timestamp"],
                })
    all_trades.sort(key=lambda x: x["timestamp"], reverse=True)
    return all_trades[:10]


@router.post("/send")
async def chat_send(msg: ChatMessage):
    """Process a user chat message and return an AI-generated response."""
    user_text = msg.message.lower().strip()

    # ── Agent status / decisions / what are they doing ─────────
    if any(kw in user_text for kw in ["agent", "bot", "decision", "doing", "status", "trading"]):
        agents_data = _get_agent_summary()
        if not agents_data:
            return {"type": "text", "text": "No agents are running yet. Deploy some from the AI Agents page!"}

        recent = _get_recent_trades_summary()
        total_value = sum(a["totalValue"] for a in agents_data)
        total_pnl = sum(a["pnl"] for a in agents_data)
        best = max(agents_data, key=lambda a: a["pnl"])
        worst = min(agents_data, key=lambda a: a["pnl"])

        return {
            "type": "agents_report",
            "text": f"Here's what your {len(agents_data)} AI agents are doing right now with ${total_value:,.2f} total capital.",
            "data": {
                "agents": agents_data,
                "totalValue": round(total_value, 2),
                "totalPnl": round(total_pnl, 2),
                "bestAgent": best["name"],
                "worstAgent": worst["name"],
                "recentTrades": recent[:6],
            },
        }

    # ── Analyze a specific asset ───────────────────────────────
    coin_map = {"btc": "bitcoin", "bitcoin": "bitcoin", "eth": "ethereum", "ethereum": "ethereum", "sol": "solana", "solana": "solana"}
    for keyword, coin_id in coin_map.items():
        if keyword in user_text and ("analyze" in user_text or "analysis" in user_text or "technical" in user_text):
            try:
                history = await service.fetch_crypto_history(coin_id, 60)
                prices = [p["price"] for p in history]
                signal = generate_signal(prices)
                signal["symbol"] = keyword.upper() if len(keyword) <= 4 else coin_id[:3].upper()

                # Enrich with agent exposure info
                agents = _get_agent_summary()
                exposure = []
                if agents:
                    for a in agents:
                        if keyword.upper() in a.get("positionsList", []):
                            exposure.append(a["name"])
                signal["agentExposure"] = exposure

                return {
                    "type": "analysis",
                    "text": f"Here's real-time analysis for {coin_id.capitalize()}." + (f" {len(exposure)} of your agents currently hold {keyword.upper()}." if exposure else ""),
                    "data": signal,
                }
            except Exception as e:
                return {"type": "text", "text": f"Couldn't fetch live data for {coin_id}: {str(e)}. Try again."}

    # ── Portfolio / rebalance (from live agent data) ───────────
    if any(kw in user_text for kw in ["portfolio", "rebalance", "holdings", "allocation"]):
        portfolio = _get_live_portfolio()
        total = sum(h["value"] for h in portfolio)
        wallets = get_all_wallets()
        total_pnl = sum(w.get("pnl", 0) for w in wallets.values())
        total_initial = sum(w.get("initial_capital", 0) for w in wallets.values())

        crypto_val = sum(h["value"] for h in portfolio if h["name"] in ["BTC", "ETH", "SOL"])
        stock_val = sum(h["value"] for h in portfolio if h["name"] in ["AAPL", "NVDA", "MSFT"])
        cash_val = sum(h["value"] for h in portfolio if h["name"] == "Cash")

        crypto_pct = round((crypto_val / max(total, 1)) * 100, 1)
        stock_pct = round((stock_val / max(total, 1)) * 100, 1)
        cash_pct = round((cash_val / max(total, 1)) * 100, 1)

        risk_score = min(int(crypto_pct * 0.8 + (100 - cash_pct) * 0.2), 100)

        suggestions = []
        if crypto_pct > 60:
            suggestions.append({"message": f"Crypto exposure is high at {crypto_pct}%. Consider rebalancing toward stocks.", "priority": "high"})
        if cash_pct < 5:
            suggestions.append({"message": f"Cash reserves are low ({cash_pct}%). Consider taking some profits.", "priority": "high"})
        if stock_pct < 20:
            suggestions.append({"message": f"Stock allocation is only {stock_pct}%. Consider adding blue-chip exposure.", "priority": "medium"})

        return {
            "type": "rebalance",
            "text": f"Live portfolio analysis (total: ${total:,.2f}, PnL: ${total_pnl:,.2f} from ${total_initial:,.2f} invested).",
            "data": {
                "riskScore": risk_score,
                "cryptoExposure": crypto_pct,
                "stockExposure": stock_pct,
                "cashPercent": cash_pct,
                "totalPnl": round(total_pnl, 2),
                "suggestions": suggestions,
                "holdings": portfolio,
            },
        }

    # ── Recent trades ─────────────────────────────────────────
    if any(kw in user_text for kw in ["trade", "recent", "history", "buy", "sell"]):
        trades = _get_recent_trades_summary()
        if not trades:
            return {"type": "text", "text": "No trades have been executed yet. The agents are still warming up!"}
        return {
            "type": "trades",
            "text": f"Here are the last {len(trades)} trades across all agents.",
            "data": {"trades": trades},
        }

    # ── Market overview ────────────────────────────────────────
    if any(kw in user_text for kw in ["market", "overview", "sentiment", "price"]):
        prices = service.get_all_prices()
        if not prices:
            await service.refresh_all()
            prices = service.get_all_prices()

        gainers = sorted(prices, key=lambda x: x.get("change", 0), reverse=True)[:3]
        losers = sorted(prices, key=lambda x: x.get("change", 0))[:3]
        return {
            "type": "market_overview",
            "text": "Here's the live market snapshot.",
            "data": {"topGainers": gainers, "topLosers": losers, "totalAssets": len(prices)},
        }

    # ── Strategy suggestions (informed by current agent performance) ──
    if any(kw in user_text for kw in ["strategy", "suggest", "recommend"]):
        agents = _get_agent_summary()
        best = max(agents, key=lambda a: a["pnl"]) if agents else None
        text = "Based on your agents' live performance:\n\n"
        if best:
            text += f"🏆 **{best['name']}** ({best['strategy']}) is your top performer with ${best['pnl']:,.2f} PnL and {best['winRate']}% win rate.\n\n"
        text += (
            "My recommendations:\n"
            "1. **Scale up winners** — Increase capital allocation to your best-performing strategy\n"
            "2. **Reduce losers** — Consider pausing agents with negative PnL\n"
            "3. **Diversify** — Add a DCA agent for long-term accumulation\n\n"
            "Want me to analyze a specific agent's performance?"
        )
        return {"type": "text", "text": text}

    # ── Default response ───────────────────────────────────────
    return {
        "type": "text",
        "text": (
            "I can help you with live data from your AI agents:\n\n"
            "• **\"What are my agents doing?\"** — Real-time agent status, positions & PnL\n"
            "• **\"Analyze BTC\"** — Technical analysis with agent exposure info\n"
            "• **\"Show recent trades\"** — Latest buy/sell decisions from all agents\n"
            "• **\"Review my portfolio\"** — Live holdings, risk score & rebalance suggestions\n"
            "• **\"Market overview\"** — Live prices, gainers & losers\n"
            "• **\"Suggest a strategy\"** — Recommendations based on agent performance\n\n"
            "What would you like to know?"
        ),
    }
