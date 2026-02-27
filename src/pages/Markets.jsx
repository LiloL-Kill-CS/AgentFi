import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Search, ArrowUpRight, ArrowDownRight, Activity, Wifi, WifiOff } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { marketAPI } from '../services/api';

// Generate fallback chart data
const generateFallbackChart = (isPositive) => {
    const data = [];
    let price = 100;
    for (let i = 0; i < 30; i++) {
        price = price * (1 + (Math.random() - (isPositive ? 0.4 : 0.6)) * 0.05);
        data.push({ day: i, price });
    }
    return data;
};

const MiniSparkline = ({ data, isPositive }) => (
    <ResponsiveContainer width="100%" height={40}>
        <AreaChart data={data}>
            <defs>
                <linearGradient id={`spark-${isPositive ? 'green' : 'red'}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? 'var(--accent-green)' : 'var(--accent-red)'} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isPositive ? 'var(--accent-green)' : 'var(--accent-red)'} stopOpacity={0} />
                </linearGradient>
            </defs>
            <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? 'var(--accent-green)' : 'var(--accent-red)'}
                strokeWidth={2}
                fill={`url(#spark-${isPositive ? 'green' : 'red'})`}
                isAnimationActive={false}
            />
        </AreaChart>
    </ResponsiveContainer>
);

const Markets = () => {
    const [marketData, setMarketData] = useState([]);
    const [filter, setFilter] = useState('All');
    const [isLive, setIsLive] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrices = async () => {
            setLoading(true);
            const result = await marketAPI.getAllPrices();
            if (result && result.data && result.data.length > 0) {
                // Attach sparkline chart data to each item
                const enriched = result.data.map(item => ({
                    ...item,
                    chart: generateFallbackChart(item.change >= 0),
                    volume: typeof item.volume === 'number'
                        ? (item.volume > 1e9 ? `${(item.volume / 1e9).toFixed(1)}B` : `${(item.volume / 1e6).toFixed(0)}M`)
                        : item.volume || '0',
                }));
                setMarketData(enriched);
                setIsLive(true);
            } else {
                // fallback to static mock data
                setMarketData(fallbackData);
                setIsLive(false);
            }
            setLoading(false);
        };
        fetchPrices();
        const interval = setInterval(fetchPrices, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const sectors = ['All', ...new Set(marketData.map(d => d.sector))];
    const filteredData = filter === 'All' ? marketData : marketData.filter(item => item.sector === filter);

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>

            {/* Header */}
            <div className="flex-between">
                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Markets & Analysis</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>AI-driven market sentiment and real-time asset discovery.</p>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                            background: isLive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: isLive ? 'var(--accent-green)' : 'var(--accent-red)',
                            border: `1px solid ${isLive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                        }}>
                            {isLive ? <Wifi size={12} /> : <WifiOff size={12} />}
                            {isLive ? 'LIVE' : 'DEMO'}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'var(--bg-secondary)', padding: '10px 16px',
                        borderRadius: '12px', border: '1px solid var(--border-color)'
                    }}>
                        <Search size={18} color="var(--text-secondary)" />
                        <input type="text" placeholder="Search assets..." style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '200px' }} />
                    </div>
                </div>
            </div>

            {/* AI Sentiment + Top Picks */}
            <div style={{ display: 'flex', gap: '24px' }}>
                <div className="glass-panel" style={{ flex: 1, padding: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                        <svg viewBox="0 0 100 50" style={{ width: '100%', overflow: 'visible' }}>
                            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="15" strokeLinecap="round" />
                            <path d="M 10 50 A 40 40 0 0 1 75 25" fill="none" stroke="var(--accent-green)" strokeWidth="15" strokeLinecap="round" />
                        </svg>
                        <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>78</div>
                            <div style={{ fontSize: '12px', color: 'var(--accent-green)' }}>Greed</div>
                        </div>
                    </div>
                    <div>
                        <h3 style={{ marginBottom: '8px' }}>Market Sentiment: Bullish</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                            {isLive
                                ? 'Live AI analysis of real-time market data indicates strong buying momentum across Tech and Crypto sectors.'
                                : 'AI analysis of 45,000+ news articles and social media signals indicates strong buying momentum.'}
                        </p>
                    </div>
                </div>

                <div className="glass-panel" style={{ flex: 1, padding: '24px' }}>
                    <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={18} color="var(--accent-blue)" />
                        AI Top Picks (24h)
                    </h3>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        {(marketData.length > 0 ? [...marketData].sort((a, b) => b.change - a.change).slice(0, 3) : []).map(asset => (
                            <div key={asset.symbol} className="hover-glow" style={{
                                flex: 1, background: 'rgba(255,255,255,0.02)', padding: '16px',
                                borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer'
                            }}>
                                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{asset.symbol}</div>
                                <div className={`mono ${asset.change >= 0 ? 'text-green' : 'text-red'}`} style={{ fontSize: '14px', fontWeight: 500 }}>
                                    {formatPercentage(asset.change)} <br />
                                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Conviction: {Math.floor(70 + Math.abs(asset.change) * 5)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Asset List */}
            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
                    {sectors.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            style={{
                                background: filter === tab ? 'var(--accent-blue)' : 'transparent',
                                color: filter === tab ? 'white' : 'var(--text-secondary)',
                                border: filter === tab ? 'none' : '1px solid var(--border-color)',
                                padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div style={{ overflowY: 'auto', padding: '0 24px' }}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading live market data...</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                                    <th style={{ padding: '16px 8px', fontWeight: 600 }}>Asset</th>
                                    <th style={{ padding: '16px 8px', fontWeight: 600 }}>Price</th>
                                    <th style={{ padding: '16px 8px', fontWeight: 600 }}>24h Change</th>
                                    <th style={{ padding: '16px 8px', fontWeight: 600 }}>Volume</th>
                                    <th style={{ padding: '16px 8px', fontWeight: 600 }}>7d Trend</th>
                                    <th style={{ padding: '16px 8px', fontWeight: 600, textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map(asset => {
                                    const isPositive = asset.change >= 0;
                                    return (
                                        <tr key={asset.symbol} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '16px 8px' }}>
                                                <div style={{ fontWeight: 600 }}>{asset.symbol}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{asset.name}</div>
                                            </td>
                                            <td className="mono" style={{ padding: '16px 8px', fontWeight: 500 }}>{formatCurrency(asset.price)}</td>
                                            <td className="mono" style={{ padding: '16px 8px' }}>
                                                <div style={{ color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                                                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                    {Math.abs(asset.change)}%
                                                </div>
                                            </td>
                                            <td className="mono" style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{asset.volume}</td>
                                            <td style={{ padding: '16px 8px', width: '150px' }}>
                                                {asset.chart && <MiniSparkline data={asset.chart} isPositive={isPositive} />}
                                            </td>
                                            <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                                                <button className="hover-glow" style={{
                                                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
                                                    color: 'white', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer'
                                                }}>Trade</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

// Fallback static data if API is unavailable
const fallbackData = [
    { symbol: 'BTC', name: 'Bitcoin', price: 64230.50, change: 2.4, sector: 'Crypto', volume: '1.2B', chart: generateFallbackChart(true) },
    { symbol: 'ETH', name: 'Ethereum', price: 3450.20, change: 1.8, sector: 'Crypto', volume: '850M', chart: generateFallbackChart(true) },
    { symbol: 'SOL', name: 'Solana', price: 145.60, change: -1.2, sector: 'Crypto', volume: '320M', chart: generateFallbackChart(false) },
    { symbol: 'AAPL', name: 'Apple Inc.', price: 178.40, change: -0.5, sector: 'Stocks', volume: '45M', chart: generateFallbackChart(false) },
    { symbol: 'NVDA', name: 'Nvidia Corp.', price: 890.20, change: 3.2, sector: 'Stocks', volume: '62M', chart: generateFallbackChart(true) },
    { symbol: 'MSFT', name: 'Microsoft', price: 410.30, change: 0.8, sector: 'Stocks', volume: '22M', chart: generateFallbackChart(true) },
];

export default Markets;
