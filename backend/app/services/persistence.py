"""
Persistence layer — saves agent configs, wallets, and trade history to JSON files
so everything survives server restarts and PC reboots.
"""
import json
import os
import time
from typing import Dict, List, Any

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
AGENTS_FILE = os.path.join(DATA_DIR, "agents.json")
WALLETS_FILE = os.path.join(DATA_DIR, "wallets.json")
TRADES_FILE = os.path.join(DATA_DIR, "trades.json")


def _ensure_dir():
    os.makedirs(DATA_DIR, exist_ok=True)


def save_agents(agents: List[dict]):
    _ensure_dir()
    with open(AGENTS_FILE, "w") as f:
        json.dump(agents, f, indent=2, default=str)


def load_agents() -> List[dict]:
    if not os.path.exists(AGENTS_FILE):
        return []
    try:
        with open(AGENTS_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return []


def save_wallets(wallets: Dict[int, dict]):
    _ensure_dir()
    # Convert int keys to strings for JSON
    serializable = {}
    for k, v in wallets.items():
        w = {**v}
        # Make positions serializable
        w["positions"] = {
            sym: {kk: vv for kk, vv in pos.items()}
            for sym, pos in w.get("positions", {}).items()
        }
        serializable[str(k)] = w
    with open(WALLETS_FILE, "w") as f:
        json.dump(serializable, f, indent=2, default=str)


def load_wallets() -> Dict[int, dict]:
    if not os.path.exists(WALLETS_FILE):
        return {}
    try:
        with open(WALLETS_FILE, "r") as f:
            raw = json.load(f)
        # Convert string keys back to ints
        return {int(k): v for k, v in raw.items()}
    except (json.JSONDecodeError, IOError):
        return {}


def save_trades(trades: Dict[int, List[dict]]):
    _ensure_dir()
    serializable = {str(k): v for k, v in trades.items()}
    with open(TRADES_FILE, "w") as f:
        json.dump(serializable, f, indent=2, default=str)


def load_trades() -> Dict[int, List[dict]]:
    if not os.path.exists(TRADES_FILE):
        return {}
    try:
        with open(TRADES_FILE, "r") as f:
            raw = json.load(f)
        return {int(k): v for k, v in raw.items()}
    except (json.JSONDecodeError, IOError):
        return {}
