import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { assetAllocation, portfolioHistory, portfolioStats } from '../data/mockData';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { ArrowUpRight, ArrowDownRight, Briefcase, RefreshCw, Download } from 'lucide-react';

const Portfolio = () => {
    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div className="flex-between">
                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Portfolio Tracker</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Detailed breakdown of your holdings across Crypto and Stocks.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="hover-glow" style={{
                        background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-color)',
                        padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <Download size={16} /> Export CSV
                    </button>
                    <button className="hover-glow" style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none',
                        padding: '10px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <RefreshCw size={16} /> Auto-Rebalance
                    </button>
                </div>
            </div>

            {/* Main Net Worth Chart */}
            <div className="glass-panel" style={{ padding: '24px', height: '360px', display: 'flex', flexDirection: 'column' }}>
                <div className="flex-between" style={{ marginBottom: '24px' }}>
                    <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Net Worth</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                            <h2 className="mono" style={{ fontSize: '32px', margin: 0 }}>{formatCurrency(portfolioStats.totalValue)}</h2>
                            <div className="text-green" style={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                                <ArrowUpRight size={18} /> +9.4% (All Time)
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px' }}>
                        {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map(t => (
                            <button key={t} style={{
                                background: t === '1M' ? 'var(--accent-blue)' : 'transparent',
                                color: t === '1M' ? 'white' : 'var(--text-secondary)',
                                border: 'none', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500
                            }}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ flex: 1, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={portfolioHistory}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} domain={['dataMin', 'dataMax']} />
                            <RechartsTooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                            <Area type="monotone" dataKey="value" stroke="var(--accent-cyan)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Asset Breakdown */}
            <div style={{ display: 'flex', gap: '24px' }}>

                {/* Holdings Table */}
                <div className="glass-panel" style={{ flex: 2, padding: '24px' }}>
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Briefcase size={18} color="var(--accent-gold)" />
                        Current Holdings
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Asset</th>
                                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Balance</th>
                                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Value</th>
                                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Avg Entry</th>
                                <th style={{ padding: '12px 8px', fontWeight: 600, textAlign: 'right' }}>PnL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assetAllocation.map((asset, i) => {
                                const isPositive = i % 2 === 0; // Mock logic
                                const pnlPerf = isPositive ? 12.4 : -3.2;
                                return (
                                    <tr key={asset.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '16px 8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: asset.color }} />
                                                <span style={{ fontWeight: 600 }}>{asset.name}</span>
                                            </div>
                                        </td>
                                        <td className="mono" style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>
                                            {(asset.value / 1000).toFixed(2)}
                                        </td>
                                        <td className="mono" style={{ padding: '16px 8px', fontWeight: 500 }}>
                                            {formatCurrency(asset.value)}
                                        </td>
                                        <td className="mono" style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>
                                            {formatCurrency(asset.value * 0.9)} {/* Mock entry */}
                                        </td>
                                        <td className="mono" style={{ padding: '16px 8px', textAlign: 'right' }}>
                                            <div className={isPositive ? 'text-green' : 'text-red'} style={{ fontWeight: 600 }}>
                                                {formatCurrency(asset.value * (pnlPerf / 100))}
                                            </div>
                                            <div className={isPositive ? 'text-green' : 'text-red'} style={{ fontSize: '12px' }}>
                                                {isPositive ? '+' : ''}{pnlPerf}%
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Allocation Bar Chart */}
                <div className="glass-panel" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '24px' }}>Allocation Breakdown</h3>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={assetAllocation} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={45} />
                                <RechartsTooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                    formatter={(val) => formatCurrency(val)}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {assetAllocation.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Portfolio;
