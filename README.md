<div align="center">

# 🤖 AgentFi — AI-Powered Finance Platform

**Autonomous AI trading agents that manage virtual portfolios using real-time market data.**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)](https://python.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)

</div>

---

## 🚀 What is AgentFi?

AgentFi is a full-stack AI finance platform where autonomous trading bots manage virtual portfolios using **real market data** from CoinGecko and Yahoo Finance. Each bot runs a different strategy (Trend Following, Volatility Breakout, Mean Reversion, High Frequency) and you can watch them trade live.

### Key Features

- 📊 **Live Market Dashboard** — Real-time crypto & stock prices with AI sentiment analysis
- 🤖 **4 AI Trading Agents** — Each with $10k-$30k virtual funds, trading autonomously
- 💬 **AI Chat Assistant** — Ask "Analyze BTC" for live RSI, SMA, EMA, Momentum analysis
- 💼 **Portfolio Tracker** — Net worth charts, holdings breakdown, PnL tracking
- 📈 **Technical Analysis Engine** — RSI, SMA(20/50), EMA(12), Momentum, & Volatility
- ⚙️ **Settings & Risk Controls** — API key management, drawdown limits, 2FA toggles

---

## 🖥️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite, Recharts, Lucide Icons |
| **Backend** | Python FastAPI + Uvicorn |
| **Market Data** | CoinGecko API (Crypto), Yahoo Finance (Stocks) |
| **AI Engine** | NumPy/Pandas — RSI, SMA, EMA, Momentum scoring |
| **Styling** | Vanilla CSS, Glassmorphism dark theme |

---

## ⚡ Quick Start

### 1. Frontend
```bash
npm install
npm run dev
# → http://localhost:5173
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
# → http://localhost:8000
```

### 3. Open & Explore
- **Dashboard** — Portfolio overview with live charts
- **Markets** — Live prices with LIVE badge indicator
- **AI Agents** — Watch bots trade with virtual money in real-time
- **AI Chat** — Try: `Analyze BTC`, `Review my portfolio`, `Market overview`

---

## 🧠 How the AI Engine Works

```
Real-Time Prices → Technical Indicators → Multi-Signal Scoring → BUY/SELL/HOLD
                    (RSI, SMA, EMA)        (Weighted score)       (+ Confidence %)
```

Each agent runs a strategy loop every 10 seconds:
1. Fetches live prices from CoinGecko/Yahoo Finance
2. Analyzes momentum, trend, and volatility signals
3. Executes simulated trades based on strategy rules
4. Updates portfolio value and PnL in real-time

---

## 📁 Project Structure

```
AgentFi_ME/
├── src/                    # React Frontend
│   ├── pages/              # Dashboard, Markets, Portfolio, Agents, Chat, Settings
│   ├── components/         # Sidebar, MetricCard, MarketTicker
│   ├── services/api.js     # Frontend API client
│   └── data/mockData.js    # Fallback mock data
├── backend/                # Python FastAPI Backend
│   ├── main.py             # Server entry + lifespan events
│   └── app/
│       ├── routes/         # market, portfolio, agents, chat APIs
│       └── services/
│           ├── market_data.py  # CoinGecko + Yahoo Finance integration
│           ├── ai_engine.py    # Technical analysis & signal generation
│           └── simulator.py    # Virtual trading simulation engine
└── package.json
```

---

## 📄 License

MIT License — feel free to use this for your own projects.

---

<div align="center">
  <strong>Built with ❤️ by LiloL-Kill-CS</strong>
</div>
