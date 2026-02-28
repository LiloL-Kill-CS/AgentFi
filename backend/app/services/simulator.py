"""
Trading Simulator — Gives each AI agent virtual funds to simulate trades.
Uses real market data from CoinGecko and persists all data to disk.
"""
import asyncio
import random
import time
from typing import Dict, List
from app.services.market_data import MarketDataService
from app.services.persistence import save_wallets, load_wallets, save_trades, load_trades

market_service = MarketDataService()

# Virtual wallets for each agent
_wallets: Dict[int, dict] = {}
_trade_history: Dict[int, List[dict]] = {}
_is_running = False
_save_counter = 0  # Save every N ticks to avoid excessive disk I/O


def initialize_agent_wallet(agent_id: int, capital: float, strategy: str, asset: str):
    """Give an agent virtual currency to start trading."""
    _wallets[agent_id] = {
        "initial_capital": capital,
        "cash": capital,
        "positions": {},
        "total_value": capital,
        "pnl": 0,
        "pnl_pct": 0,
        "trades_count": 0,
        "wins": 0,
        "losses": 0,
        "strategy": strategy,
        "asset_focus": asset,
        "last_trade": None,
        "started_at": time.time(),
    }
    _trade_history[agent_id] = []
    _persist()


def get_wallet(agent_id: int) -> dict:
    return _wallets.get(agent_id, {})


def get_trade_history(agent_id: int) -> List[dict]:
    return _trade_history.get(agent_id, [])


def get_all_wallets() -> Dict[int, dict]:
    return _wallets


def _persist():
    """Save wallets and trades to disk."""
    try:
        save_wallets(_wallets)
        save_trades(_trade_history)
    except Exception as e:
        print(f"[Persistence] save error: {e}")


def _load_from_disk():
    """Load existing wallets and trades from disk."""
    global _wallets, _trade_history
    loaded_wallets = load_wallets()
    loaded_trades = load_trades()
    if loaded_wallets:
        _wallets = loaded_wallets
        print(f"[Simulator] Loaded {len(_wallets)} agent wallets from disk")
    if loaded_trades:
        _trade_history = loaded_trades
        print(f"[Simulator] Loaded trade history for {len(_trade_history)} agents")


def _execute_trade(agent_id: int, symbol: str, action: str, qty: float, price: float):
    """Execute a simulated trade for an agent."""
    wallet = _wallets.get(agent_id)
    if not wallet:
        return

    trade = {
        "timestamp": time.time(),
        "symbol": symbol,
        "action": action,
        "qty": round(qty, 6),
        "price": round(price, 2),
        "value": round(qty * price, 2),
    }

    if action == "BUY":
        cost = qty * price
        if wallet["cash"] >= cost:
            wallet["cash"] -= cost
            pos = wallet["positions"].get(symbol, {"qty": 0, "avgEntry": 0, "currentPrice": price})
            total_qty = pos["qty"] + qty
            if total_qty > 0:
                pos["avgEntry"] = ((pos["avgEntry"] * pos["qty"]) + (price * qty)) / total_qty
            pos["qty"] = total_qty
            pos["currentPrice"] = price
            wallet["positions"][symbol] = pos
            wallet["trades_count"] += 1
            trade["success"] = True
        else:
            trade["success"] = False
            trade["reason"] = "Insufficient funds"

    elif action == "SELL":
        pos = wallet["positions"].get(symbol)
        if pos and pos["qty"] >= qty:
            revenue = qty * price
            wallet["cash"] += revenue
            pnl = (price - pos["avgEntry"]) * qty
            if pnl > 0:
                wallet["wins"] += 1
            else:
                wallet["losses"] += 1
            pos["qty"] -= qty
            if pos["qty"] <= 0.0001:
                del wallet["positions"][symbol]
            else:
                pos["currentPrice"] = price
            wallet["trades_count"] += 1
            trade["success"] = True
            trade["pnl"] = round(pnl, 2)
        else:
            trade["success"] = False
            trade["reason"] = "Insufficient position"

    # Update portfolio value
    positions_value = sum(
        p["qty"] * p["currentPrice"] for p in wallet["positions"].values()
    )
    wallet["total_value"] = round(wallet["cash"] + positions_value, 2)
    wallet["pnl"] = round(wallet["total_value"] - wallet["initial_capital"], 2)
    wallet["pnl_pct"] = round((wallet["pnl"] / wallet["initial_capital"]) * 100, 2) if wallet["initial_capital"] > 0 else 0
    wallet["last_trade"] = trade

    if agent_id not in _trade_history:
        _trade_history[agent_id] = []
    _trade_history[agent_id].append(trade)
    _trade_history[agent_id] = _trade_history[agent_id][-100:]


async def run_simulation_tick():
    """One tick of the simulation loop."""
    global _save_counter
    prices = market_service.get_all_prices()
    if not prices:
        return

    price_map = {p["symbol"]: p["price"] for p in prices}

    for agent_id, wallet in _wallets.items():
        strategy = wallet["strategy"]
        asset_focus = wallet["asset_focus"]

        if "BTC" in asset_focus or "Crypto" in asset_focus:
            symbols = ["BTC", "ETH", "SOL"]
        elif "AAPL" in asset_focus or "Stock" in asset_focus:
            symbols = ["AAPL", "NVDA", "MSFT"]
        else:
            symbols = ["BTC", "ETH", "AAPL", "NVDA"]

        for symbol in symbols:
            current_price = price_map.get(symbol)
            if not current_price or current_price <= 0:
                continue

            if symbol in wallet["positions"]:
                wallet["positions"][symbol]["currentPrice"] = current_price

            should_buy, should_sell, qty_factor = _decide(strategy, wallet, symbol, current_price)

            if should_buy and wallet["cash"] > 100:
                buy_amount = wallet["cash"] * qty_factor * random.uniform(0.5, 1.0)
                qty = buy_amount / current_price
                if qty * current_price >= 10:
                    _execute_trade(agent_id, symbol, "BUY", qty, current_price)

            elif should_sell and symbol in wallet["positions"]:
                pos = wallet["positions"].get(symbol)
                if pos:
                    sell_qty = pos["qty"] * qty_factor * random.uniform(0.5, 1.0)
                    if sell_qty * current_price >= 10:
                        _execute_trade(agent_id, symbol, "SELL", sell_qty, current_price)

    # Refresh total values
    for agent_id, wallet in _wallets.items():
        positions_value = sum(
            p["qty"] * p.get("currentPrice", 0) for p in wallet["positions"].values()
        )
        wallet["total_value"] = round(wallet["cash"] + positions_value, 2)
        wallet["pnl"] = round(wallet["total_value"] - wallet["initial_capital"], 2)
        wallet["pnl_pct"] = round((wallet["pnl"] / wallet["initial_capital"]) * 100, 2) if wallet["initial_capital"] > 0 else 0

    # Auto-save every 3 ticks (30 seconds)
    _save_counter += 1
    if _save_counter >= 3:
        _persist()
        _save_counter = 0


def _decide(strategy: str, wallet: dict, symbol: str, price: float) -> tuple:
    """Strategy-specific trade decision."""
    pos = wallet["positions"].get(symbol)

    if strategy == "Trend Following":
        r = random.random()
        if r < 0.15:
            return (True, False, 0.25)
        elif r > 0.88 and pos:
            return (False, True, 0.3)
        return (False, False, 0)

    elif strategy == "Volatility Breakout":
        r = random.random()
        if r < 0.12:
            return (True, False, 0.35)
        elif r > 0.90 and pos:
            return (False, True, 0.5)
        return (False, False, 0)

    elif strategy == "Mean Reversion":
        r = random.random()
        if r < 0.10:
            return (True, False, 0.20)
        elif r > 0.92 and pos:
            return (False, True, 0.4)
        return (False, False, 0)

    elif strategy == "High Frequency":
        r = random.random()
        if r < 0.25:
            return (True, False, 0.15)
        elif r > 0.78 and pos:
            return (False, True, 0.6)
        return (False, False, 0)

    else:
        if random.random() < 0.08:
            return (True, False, 0.10)
        return (False, False, 0)


async def start_simulation_loop():
    """Background loop that runs the simulation every 10 seconds."""
    global _is_running
    _is_running = True

    # Load persisted data from disk first
    _load_from_disk()

    # Initialize default agents only if nothing was loaded
    if not _wallets:
        _default_agents = [
            (1, 25000, "Trend Following", "Crypto (BTC/ETH)"),
            (2, 30000, "Volatility Breakout", "Stocks (AAPL/NVDA/MSFT)"),
            (3, 15000, "Mean Reversion", "Crypto (BTC/ETH)"),
            (4, 10000, "High Frequency", "Crypto (SOL/AVAX/MATIC)"),
        ]
        for agent_id, capital, strategy, asset in _default_agents:
            initialize_agent_wallet(agent_id, capital, strategy, asset)
        print("[Simulator] Initialized 4 default agents with virtual funds")

    while _is_running:
        try:
            await run_simulation_tick()
        except Exception as e:
            print(f"[Simulator] tick error: {e}")
        await asyncio.sleep(10)
