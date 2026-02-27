"""
Market Data API routes — serves real-time prices and AI analysis.
"""
from fastapi import APIRouter, Query
from app.services.market_data import MarketDataService
from app.services.ai_engine import generate_signal

router = APIRouter()
service = MarketDataService()


@router.get("/prices")
async def get_all_prices():
    """Get all current market prices (crypto + stocks)."""
    data = service.get_all_prices()
    if not data:
        # If cache is empty, fetch now
        await service.refresh_all()
        data = service.get_all_prices()
    return {"data": data, "count": len(data)}


@router.get("/crypto")
async def get_crypto_prices():
    """Get crypto prices only."""
    data = service.get_crypto_prices()
    if not data:
        data = await service.fetch_crypto_prices()
    return {"data": data}


@router.get("/stocks")
async def get_stock_prices():
    """Get stock prices only."""
    data = service.get_stock_prices()
    if not data:
        data = await service.fetch_stock_prices()
    return {"data": data}


@router.get("/history/{coin_id}")
async def get_price_history(
    coin_id: str = "bitcoin",
    days: int = Query(default=30, ge=1, le=365),
):
    """Get historical price data for a crypto asset."""
    data = await service.fetch_crypto_history(coin_id, days)
    return {"coin": coin_id, "days": days, "data": data}


@router.get("/analysis/{symbol}")
async def get_ai_analysis(symbol: str):
    """Get AI trading signal for a specific asset."""
    # Try to get historical data for analysis
    coin_map = {"BTC": "bitcoin", "ETH": "ethereum", "SOL": "solana", "ADA": "cardano", "XRP": "ripple"}
    coin_id = coin_map.get(symbol.upper())

    if coin_id:
        history = await service.fetch_crypto_history(coin_id, 60)
        prices = [p["price"] for p in history]
    else:
        # For stocks, generate simulated history from current data for demo
        import random
        stock_data = service.get_stock_prices()
        current = next((s for s in stock_data if s["symbol"] == symbol.upper()), None)
        if current:
            base = current["price"]
            prices = [base * (1 + random.uniform(-0.03, 0.03)) for _ in range(60)]
            prices.append(base)
        else:
            return {"error": f"Symbol {symbol} not found"}

    signal = generate_signal(prices)
    signal["symbol"] = symbol.upper()
    return signal
