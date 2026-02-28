"""
AgentFi Backend — FastAPI Server
Real-time market data, AI signal generation, trading simulation, and portfolio management.
"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import market, portfolio, agents, chat, dashboard
from app.services.market_data import MarketDataService
from app.services.simulator import start_simulation_loop

market_service = MarketDataService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: begin background market data polling + trading simulation
    market_task = asyncio.create_task(market_service.start_polling())
    sim_task = asyncio.create_task(start_simulation_loop())
    yield
    # Shutdown: cancel
    market_task.cancel()
    sim_task.cancel()

app = FastAPI(
    title="AgentFi API",
    description="AI-powered finance agent backend with live trading simulation",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(market.router, prefix="/api/market", tags=["Market Data"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["Portfolio"])
app.include_router(agents.router, prefix="/api/agents", tags=["AI Agents"])
app.include_router(chat.router, prefix="/api/chat", tags=["AI Chat"])

@app.get("/api/health")
async def health_check():
    return {"status": "online", "service": "AgentFi API", "version": "1.0.0"}
