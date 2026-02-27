export const portfolioStats = {
    totalValue: 147832.50,
    dailyPnL: 2340.25,
    dailyPnLPercentage: 1.6,
    activeAgents: 5,
    winRate: 78.4,
};

export const assetAllocation = [
    { name: 'BTC', value: 45000, color: '#f59e0b' }, // Bitcoin (Crypto)
    { name: 'AAPL', value: 32000, color: '#3b82f6' }, // Apple (Stock)
    { name: 'ETH', value: 28000, color: '#8b5cf6' }, // Ethereum (Crypto)
    { name: 'NVDA', value: 18000, color: '#10b981' }, // Nvidia (Stock)
    { name: 'SOL', value: 12000, color: '#06b6d4' }, // Solana (Crypto)
    { name: 'Cash', value: 12832.50, color: '#94a3b8' },
];

export const marketTickerData = [
    { symbol: 'BTC', price: 64230.50, change: 2.4 },
    { symbol: 'ETH', price: 3450.20, change: 1.8 },
    { symbol: 'AAPL', price: 178.40, change: -0.5 },
    { symbol: 'NVDA', price: 890.20, change: 3.2 },
    { symbol: 'SOL', price: 145.60, change: -1.2 },
    { symbol: 'MSFT', price: 410.30, change: 0.8 },
    { symbol: 'AMZN', price: 175.20, change: 1.1 },
    { symbol: 'TSLA', price: 180.50, change: -2.4 },
];

export const activeAgents = [
    {
        id: 1,
        name: 'Alpha Momentum',
        strategy: 'Trend Following',
        asset: 'Crypto (BTC/ETH)',
        pnl: 14500.50,
        pnlPercentage: 24.5,
        status: 'active',
        runtime: '45 days'
    },
    {
        id: 2,
        name: 'Tech Breakout',
        strategy: 'Volatility Breakout',
        asset: 'Stocks (AAPL/NVDA/MSFT)',
        pnl: 8240.20,
        pnlPercentage: 15.2,
        status: 'active',
        runtime: '30 days'
    },
    {
        id: 3,
        name: 'Stable Yield',
        strategy: 'Mean Reversion',
        asset: 'Forex (EUR/USD, GBP/USD)',
        pnl: 2100.80,
        pnlPercentage: 5.6,
        status: 'paused',
        runtime: '120 days'
    },
    {
        id: 4,
        name: 'Altcoin Scalper',
        strategy: 'High Frequency',
        asset: 'Crypto (SOL/AVAX/MATIC)',
        pnl: 5600.40,
        pnlPercentage: -2.4,
        status: 'active',
        runtime: '14 days'
    }
];

// Generate some mock portfolio history data for charts
export const generatePortfolioHistory = () => {
    const data = [];
    let value = 100000;
    for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Add some random walk
        const change = (Math.random() - 0.45) * 5000;
        value += change;

        data.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: value
        });
    }
    return data;
};

export const portfolioHistory = generatePortfolioHistory();
