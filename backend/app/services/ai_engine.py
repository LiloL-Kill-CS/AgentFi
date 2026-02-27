"""
AI Engine — Signal Generation & Portfolio Analysis
Uses technical indicators (RSI, moving averages, momentum) to generate trading signals.
"""
import numpy as np
from typing import List, Dict, Optional


def compute_rsi(prices: List[float], period: int = 14) -> float:
    """Compute Relative Strength Index."""
    if len(prices) < period + 1:
        return 50.0  # neutral
    deltas = np.diff(prices[-period - 1:])
    gains = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    avg_gain = np.mean(gains) if len(gains) > 0 else 0
    avg_loss = np.mean(losses) if len(losses) > 0 else 0
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return round(100 - (100 / (1 + rs)), 2)


def compute_sma(prices: List[float], period: int) -> Optional[float]:
    """Simple Moving Average."""
    if len(prices) < period:
        return None
    return round(np.mean(prices[-period:]), 2)


def compute_ema(prices: List[float], period: int) -> Optional[float]:
    """Exponential Moving Average."""
    if len(prices) < period:
        return None
    weights = np.exp(np.linspace(-1., 0., period))
    weights /= weights.sum()
    return round(np.dot(weights, prices[-period:]), 2)


def compute_momentum(prices: List[float], period: int = 10) -> float:
    """Percentage change over last N periods."""
    if len(prices) < period + 1:
        return 0.0
    return round(((prices[-1] - prices[-period - 1]) / prices[-period - 1]) * 100, 2)


def compute_volatility(prices: List[float], period: int = 20) -> float:
    """Annualized volatility from last N prices."""
    if len(prices) < period:
        return 0.0
    returns = np.diff(prices[-period:]) / prices[-period:-1]
    return round(float(np.std(returns) * np.sqrt(252) * 100), 2)


def generate_signal(prices: List[float]) -> Dict:
    """
    Generate a comprehensive trading signal from price history.
    Returns signal, confidence, and all indicators.
    """
    if len(prices) < 30:
        return {
            "signal": "HOLD",
            "confidence": 0,
            "reason": "Insufficient data",
            "indicators": {},
        }

    rsi = compute_rsi(prices)
    sma_20 = compute_sma(prices, 20)
    sma_50 = compute_sma(prices, 50) or sma_20
    ema_12 = compute_ema(prices, 12)
    momentum = compute_momentum(prices)
    volatility = compute_volatility(prices)
    current_price = prices[-1]

    # Scoring system: each indicator contributes a score from -1 to +1
    score = 0
    reasons = []

    # RSI signal
    if rsi < 30:
        score += 1
        reasons.append(f"RSI oversold ({rsi})")
    elif rsi > 70:
        score -= 1
        reasons.append(f"RSI overbought ({rsi})")
    elif rsi < 45:
        score += 0.3
    elif rsi > 55:
        score -= 0.3

    # Price vs SMA
    if sma_20 and current_price > sma_20:
        score += 0.5
        reasons.append("Price above SMA20 (bullish)")
    elif sma_20:
        score -= 0.5
        reasons.append("Price below SMA20 (bearish)")

    # SMA crossover
    if sma_20 and sma_50:
        if sma_20 > sma_50:
            score += 0.5
            reasons.append("Golden cross (SMA20 > SMA50)")
        else:
            score -= 0.5
            reasons.append("Death cross (SMA20 < SMA50)")

    # Momentum
    if momentum > 5:
        score += 0.5
        reasons.append(f"Strong upward momentum ({momentum}%)")
    elif momentum < -5:
        score -= 0.5
        reasons.append(f"Strong downward momentum ({momentum}%)")

    # Determine signal
    if score >= 1.0:
        signal = "STRONG_BUY"
    elif score >= 0.5:
        signal = "BUY"
    elif score <= -1.0:
        signal = "STRONG_SELL"
    elif score <= -0.5:
        signal = "SELL"
    else:
        signal = "HOLD"

    confidence = min(abs(score) / 2.5 * 100, 95)

    return {
        "signal": signal,
        "confidence": round(confidence, 1),
        "score": round(score, 2),
        "reason": "; ".join(reasons) if reasons else "No strong directional signals",
        "indicators": {
            "rsi": rsi,
            "sma20": sma_20,
            "sma50": sma_50,
            "ema12": ema_12,
            "momentum": momentum,
            "volatility": volatility,
            "currentPrice": current_price,
        },
    }


def analyze_portfolio(holdings: List[Dict]) -> Dict:
    """Analyze a portfolio and return rebalancing suggestions."""
    total_value = sum(h.get("value", 0) for h in holdings)
    if total_value == 0:
        return {"suggestions": [], "riskScore": 0}

    allocations = []
    suggestions = []

    for h in holdings:
        pct = (h["value"] / total_value) * 100
        allocations.append({"asset": h["name"], "percentage": round(pct, 1)})

        # Flag over-concentration
        if pct > 40:
            suggestions.append({
                "type": "REDUCE",
                "asset": h["name"],
                "message": f"{h['name']} represents {pct:.1f}% of portfolio — consider reducing to below 30% for better diversification.",
                "priority": "high",
            })
        elif pct < 5 and h["name"] != "Cash":
            suggestions.append({
                "type": "INCREASE",
                "asset": h["name"],
                "message": f"{h['name']} is only {pct:.1f}% — consider increasing position if you're bullish.",
                "priority": "low",
            })

    # Check crypto vs stocks balance
    crypto_pct = sum(a["percentage"] for a in allocations if a["asset"] in ["BTC", "ETH", "SOL", "ADA", "XRP"])
    stock_pct = sum(a["percentage"] for a in allocations if a["asset"] in ["AAPL", "NVDA", "MSFT", "TSLA", "META"])

    if crypto_pct > 60:
        suggestions.append({
            "type": "REBALANCE",
            "asset": "Portfolio",
            "message": f"Crypto exposure at {crypto_pct:.0f}% is high. Consider adding more stocks for stability.",
            "priority": "medium",
        })

    # Simple risk score (higher crypto = higher risk)
    risk_score = min(round(crypto_pct * 0.8 + 20, 0), 100)

    return {
        "allocations": allocations,
        "suggestions": suggestions,
        "riskScore": risk_score,
        "cryptoExposure": round(crypto_pct, 1),
        "stockExposure": round(stock_pct, 1),
    }
