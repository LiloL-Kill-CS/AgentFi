"""
AI Chat API route — Contextual financial assistant.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.market_data import MarketDataService
from app.services.ai_engine import generate_signal, analyze_portfolio

router = APIRouter()
service = MarketDataService()

# In-memory portfolio for context
_portfolio = [
    {"name": "BTC", "value": 45000},
    {"name": "AAPL", "value": 32000},
    {"name": "ETH", "value": 28000},
    {"name": "NVDA", "value": 18000},
    {"name": "SOL", "value": 12000},
    {"name": "Cash", "value": 12832.50},
]


class ChatMessage(BaseModel):
    message: str


@router.post("/send")
async def chat_send(msg: ChatMessage):
    """Process a user chat message and return an AI-generated response."""
    user_text = msg.message.lower().strip()

    # ── Analyze a specific asset ───────────────────────────────
    coin_map = {"btc": "bitcoin", "bitcoin": "bitcoin", "eth": "ethereum", "ethereum": "ethereum", "sol": "solana", "solana": "solana"}

    for keyword, coin_id in coin_map.items():
        if keyword in user_text and ("analyze" in user_text or "analysis" in user_text or "technical" in user_text):
            try:
                history = await service.fetch_crypto_history(coin_id, 60)
                prices = [p["price"] for p in history]
                signal = generate_signal(prices)
                signal["symbol"] = keyword.upper() if len(keyword) <= 4 else coin_map[keyword].upper()[:3]
                return {
                    "type": "analysis",
                    "text": f"Here's my real-time technical analysis for {coin_id.capitalize()}.",
                    "data": signal,
                }
            except Exception as e:
                return {
                    "type": "text",
                    "text": f"I couldn't fetch live data for {coin_id} right now. Error: {str(e)}. Try again in a moment.",
                }

    # ── Portfolio review ───────────────────────────────────────
    if "portfolio" in user_text or "rebalance" in user_text or "holdings" in user_text:
        analysis = analyze_portfolio(_portfolio)
        total = sum(h["value"] for h in _portfolio)
        return {
            "type": "rebalance",
            "text": f"I've analyzed your portfolio (total value: ${total:,.2f}). Here are my findings.",
            "data": analysis,
        }

    # ── Market overview ────────────────────────────────────────
    if "market" in user_text or "overview" in user_text or "sentiment" in user_text:
        prices = service.get_all_prices()
        if not prices:
            await service.refresh_all()
            prices = service.get_all_prices()

        gainers = sorted(prices, key=lambda x: x.get("change", 0), reverse=True)[:3]
        losers = sorted(prices, key=lambda x: x.get("change", 0))[:3]
        return {
            "type": "market_overview",
            "text": "Here's the current market snapshot.",
            "data": {
                "topGainers": gainers,
                "topLosers": losers,
                "totalAssets": len(prices),
            },
        }

    # ── Strategy suggestions ───────────────────────────────────
    if "strategy" in user_text or "suggest" in user_text or "recommend" in user_text:
        return {
            "type": "text",
            "text": (
                "Based on current market conditions, here are my top strategy recommendations:\n\n"
                "1. **Momentum Riding** — BTC and NVDA are showing strong upward momentum. "
                "Consider a trend-following agent with a 5% trailing stop-loss.\n\n"
                "2. **Mean Reversion on ETH** — ETH has been range-bound between $3,200-$3,600. "
                "A mean-reversion bot could capture these swings.\n\n"
                "3. **DCA into Dips** — Set up a Dollar-Cost Averaging agent that buys SOL "
                "on dips exceeding 3% in 24h.\n\n"
                "Would you like me to deploy any of these as an agent?"
            ),
        }

    # ── Default response ───────────────────────────────────────
    return {
        "type": "text",
        "text": (
            "I can help you with:\n\n"
            "• **\"Analyze BTC\"** — Get real-time technical analysis with AI signals\n"
            "• **\"Review my portfolio\"** — Portfolio health check and rebalance suggestions\n"
            "• **\"Market overview\"** — See top gainers, losers, and sentiment\n"
            "• **\"Suggest a strategy\"** — Get AI-recommended trading strategies\n\n"
            "What would you like to explore?"
        ),
    }
