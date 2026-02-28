/**
 * AgentFi API Client — Connects the frontend to the FastAPI backend.
 */
const API_BASE = 'http://localhost:8000/api';

async function request(endpoint, options = {}) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error(`[AgentFi API] ${endpoint}:`, err);
        return null;
    }
}

// ── Market Data ─────────────────────────────────────────────
export const marketAPI = {
    getAllPrices: () => request('/market/prices'),
    getCrypto: () => request('/market/crypto'),
    getStocks: () => request('/market/stocks'),
    getHistory: (coinId = 'bitcoin', days = 30) =>
        request(`/market/history/${coinId}?days=${days}`),
    getAnalysis: (symbol) => request(`/market/analysis/${symbol}`),
};

// ── Portfolio ───────────────────────────────────────────────
export const portfolioAPI = {
    getHoldings: () => request('/portfolio/holdings'),
    getAnalysis: () => request('/portfolio/analysis'),
    rebalance: (adjustments) =>
        request('/portfolio/rebalance', {
            method: 'POST',
            body: JSON.stringify({ adjustments }),
        }),
};

// ── AI Agents ───────────────────────────────────────────────
export const agentsAPI = {
    list: () => request('/agents/'),
    get: (id) => request(`/agents/${id}`),
    create: (data) =>
        request('/agents/create', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    toggle: (id) => request(`/agents/${id}/toggle`, { method: 'POST' }),
};

// ── AI Chat ─────────────────────────────────────────────────
export const chatAPI = {
    send: (message) =>
        request('/chat/send', {
            method: 'POST',
            body: JSON.stringify({ message }),
        }),
};

// ── Health ──────────────────────────────────────────────────
export const healthAPI = {
    check: () => request('/health'),
};

// ── Dashboard ───────────────────────────────────────────
export const dashboardAPI = {
    getStats: () => request('/dashboard/stats'),
};
