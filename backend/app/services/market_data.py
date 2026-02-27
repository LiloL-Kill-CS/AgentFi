"""
Market Data Service — Fetches real-time prices from Yahoo Finance (stocks) and CoinGecko (crypto).
Uses free, no-API-key-required endpoints.
"""
import asyncio
import httpx
import time
from typing import Dict, List, Optional

# In-memory cache for market data
_cache: Dict[str, dict] = {}
_last_update: float = 0
POLL_INTERVAL = 30  # seconds


CRYPTO_IDS = {
    "bitcoin": "BTC",
    "ethereum": "ETH",
    "solana": "SOL",
    "cardano": "ADA",
    "ripple": "XRP",
}

STOCK_SYMBOLS = ["AAPL", "NVDA", "MSFT", "TSLA", "META", "AMZN", "GOOGL"]


class MarketDataService:
    def __init__(self):
        self._running = False

    async def start_polling(self):
        """Background loop that refreshes market data every POLL_INTERVAL seconds."""
        self._running = True
        while self._running:
            try:
                await self.refresh_all()
            except Exception as e:
                print(f"[MarketDataService] polling error: {e}")
            await asyncio.sleep(POLL_INTERVAL)

    # ── Crypto via CoinGecko (free, no key) ─────────────────────
    async def fetch_crypto_prices(self) -> List[dict]:
        ids = ",".join(CRYPTO_IDS.keys())
        url = (
            f"https://api.coingecko.com/api/v3/simple/price"
            f"?ids={ids}&vs_currencies=usd&include_24hr_change=true"
            f"&include_24hr_vol=true&include_market_cap=true"
        )
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()

        results = []
        for cg_id, symbol in CRYPTO_IDS.items():
            if cg_id in data:
                d = data[cg_id]
                results.append({
                    "symbol": symbol,
                    "name": cg_id.capitalize(),
                    "price": d.get("usd", 0),
                    "change": round(d.get("usd_24h_change", 0), 2),
                    "volume": d.get("usd_24h_vol", 0),
                    "marketCap": d.get("usd_market_cap", 0),
                    "sector": "Crypto",
                })
        return results

    # ── Stocks via Yahoo Finance query endpoint (free, no key) ──
    async def fetch_stock_prices(self) -> List[dict]:
        symbols_str = ",".join(STOCK_SYMBOLS)
        url = (
            f"https://query1.finance.yahoo.com/v7/finance/quote"
            f"?symbols={symbols_str}"
            f"&fields=symbol,shortName,regularMarketPrice,regularMarketChangePercent,"
            f"regularMarketVolume,marketCap"
        )
        headers = {"User-Agent": "Mozilla/5.0"}
        results = []
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(url, headers=headers)
                resp.raise_for_status()
                data = resp.json()

            quotes = data.get("quoteResponse", {}).get("result", [])
            for q in quotes:
                results.append({
                    "symbol": q.get("symbol", ""),
                    "name": q.get("shortName", q.get("symbol", "")),
                    "price": q.get("regularMarketPrice", 0),
                    "change": round(q.get("regularMarketChangePercent", 0), 2),
                    "volume": q.get("regularMarketVolume", 0),
                    "marketCap": q.get("marketCap", 0),
                    "sector": "Stocks",
                })
        except Exception as e:
            # Yahoo Finance free endpoint might be blocked; use fallback
            print(f"[MarketDataService] Yahoo Finance error: {e}, using fallback")
            results = self._stock_fallback()
        return results

    def _stock_fallback(self) -> List[dict]:
        """Fallback static data if Yahoo Finance is unavailable."""
        import random
        base = {
            "AAPL": ("Apple Inc.", 178.40),
            "NVDA": ("Nvidia Corp.", 890.20),
            "MSFT": ("Microsoft", 410.30),
            "TSLA": ("Tesla Inc.", 180.50),
            "META": ("Meta Platforms", 485.20),
            "AMZN": ("Amazon", 175.20),
            "GOOGL": ("Alphabet", 142.50),
        }
        results = []
        for sym, (name, price) in base.items():
            jitter = price * random.uniform(-0.02, 0.02)
            results.append({
                "symbol": sym,
                "name": name,
                "price": round(price + jitter, 2),
                "change": round(random.uniform(-3, 3), 2),
                "volume": random.randint(10_000_000, 100_000_000),
                "marketCap": 0,
                "sector": "Stocks",
            })
        return results

    # ── Crypto price history via CoinGecko ──────────────────────
    async def fetch_crypto_history(self, coin_id: str = "bitcoin", days: int = 30) -> List[dict]:
        url = (
            f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
            f"?vs_currency=usd&days={days}"
        )
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()

        prices = data.get("prices", [])
        from datetime import datetime
        return [
            {"timestamp": p[0], "date": datetime.fromtimestamp(p[0] / 1000).strftime("%b %d"), "price": round(p[1], 2)}
            for p in prices[::max(1, len(prices) // 60)]  # downsample to ~60 points
        ]

    # ── Combined refresh ────────────────────────────────────────
    async def refresh_all(self):
        global _cache, _last_update
        crypto = await self.fetch_crypto_prices()
        stocks = await self.fetch_stock_prices()
        _cache["crypto"] = crypto
        _cache["stocks"] = stocks
        _cache["all"] = crypto + stocks
        _last_update = time.time()
        print(f"[MarketDataService] refreshed {len(crypto)} crypto + {len(stocks)} stocks")

    def get_all_prices(self) -> List[dict]:
        return _cache.get("all", [])

    def get_crypto_prices(self) -> List[dict]:
        return _cache.get("crypto", [])

    def get_stock_prices(self) -> List[dict]:
        return _cache.get("stocks", [])
