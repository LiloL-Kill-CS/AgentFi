import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart as RechartsPieChart, Pie, Cell, Legend
} from 'recharts';
import { Bot, Zap, Wifi, WifiOff } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { dashboardAPI, agentsAPI } from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [agents, setAgents] = useState([]);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        const fetchDashboard = async () => {
            const [dashData, agentsData] = await Promise.all([
                dashboardAPI.getStats(),
                agentsAPI.list(),
            ]);
            if (dashData) {
                setStats(dashData);
                setIsLive(true);
            } else {
                setIsLive(false);
            }
            if (agentsData && agentsData.agents) {
                setAgents(agentsData.agents);
            }
        };
        fetchDashboard();
        const interval = setInterval(fetchDashboard, 5000); // refresh every 5s
        return () => clearInterval(interval);
    }, []);

    if (!stats) {
        return (
            <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                Loading live dashboard data...
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div className="flex-between">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h1 style={{ fontSize: '28px' }}>Dashboard</h1>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                            background: isLive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: isLive ? 'var(--accent-green)' : 'var(--accent-red)',
                            border: `1px solid ${isLive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                        }}>
                            {isLive ? <Wifi size={12} /> : <WifiOff size={12} />}
                            {isLive ? 'LIVE' : 'OFFLINE'}
                        </div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>Real-time portfolio tracking. Data refreshes every 5 seconds.</p>
                </div>
                <button className="hover-glow" style={{
                    background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                    color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px',
                    fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <Zap size={18} /> Deploy New Agent
                </button>
            </div>

            {/* Metrics Row — all from live backend */}
            <div style={{ display: 'flex', gap: '24px' }}>
                <MetricCard
                    title="Total Portfolio Value"
                    value={formatCurrency(stats.portfolioValue)}
                    type="neutral"
                />
                <MetricCard
                    title="24h Profit / Loss"
                    value={formatCurrency(stats.dailyPnL)}
                    percentage={stats.dailyPnLPercentage}
                />
                <MetricCard
                    title="Active Agents"
                    value={stats.activeAgents}
                    type="neutral"
                />
                <MetricCard
                    title="AI Win Rate"
                    value={`${stats.winRate}%`}
                    type="neutral"
                />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'flex', gap: '24px', height: '400px' }}>
                {/* Performance Chart */}
                <div className="glass-panel" style={{ flex: 2, padding: '24px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '24px' }}>Portfolio Performance (30 Days)</h3>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.portfolioHistory}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.5} />
                                        <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis
                                    stroke="var(--text-secondary)" fontSize={12}
                                    tickLine={false} axisLine={false}
                                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                    domain={['dataMin - 2000', 'dataMax + 2000']}
                                />
                                <Tooltip
                                    formatter={(val) => formatCurrency(val)}
                                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="var(--accent-cyan)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Allocation + Sentiment */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Asset Allocation from live positions */}
                    <div className="glass-panel" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ marginBottom: '12px' }}>Asset Allocation</h3>
                        <div style={{ flex: 1, minHeight: 0 }}>
                            {stats.assetAllocation && stats.assetAllocation.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={stats.assetAllocation}
                                            cx="50%" cy="50%"
                                            innerRadius={45} outerRadius={75}
                                            paddingAngle={5} dataKey="value" stroke="none"
                                        >
                                            {stats.assetAllocation.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => formatCurrency(value)}
                                            contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                        />
                                        <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', paddingTop: '30px' }}>No positions yet — agents are trading...</div>
                            )}
                        </div>
                    </div>

                    {/* Live Market Sentiment */}
                    <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ position: 'relative', width: '80px', height: '50px', flexShrink: 0 }}>
                            <svg viewBox="0 0 100 50" style={{ width: '100%', overflow: 'visible' }}>
                                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" strokeLinecap="round" />
                                <path d={`M 10 50 A 40 40 0 0 1 ${10 + (stats.sentiment.score / 100) * 80} ${50 - Math.sin(Math.PI * stats.sentiment.score / 100) * 40}`}
                                    fill="none"
                                    stroke={stats.sentiment.score >= 60 ? 'var(--accent-green)' : stats.sentiment.score >= 40 ? 'var(--accent-gold)' : 'var(--accent-red)'}
                                    strokeWidth="12" strokeLinecap="round"
                                />
                            </svg>
                            <div style={{ position: 'absolute', bottom: '-2px', left: '0', width: '100%', textAlign: 'center' }}>
                                <div className="mono" style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.sentiment.score}</div>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Market Sentiment</div>
                            <div style={{
                                fontSize: '13px', fontWeight: 600,
                                color: stats.sentiment.score >= 60 ? 'var(--accent-green)' : stats.sentiment.score >= 40 ? 'var(--accent-gold)' : 'var(--accent-red)'
                            }}>
                                {stats.sentiment.label}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Calculated from live price data</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Agents from live backend */}
            <div className="glass-panel" style={{ padding: '24px' }}>
                <div className="flex-between" style={{ marginBottom: '20px' }}>
                    <h3>Top Performing Agents</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{stats.totalTrades} total trades</span>
                        <button style={{
                            background: 'transparent', color: 'var(--accent-blue)',
                            border: 'none', cursor: 'pointer', fontWeight: 600
                        }}>View All</button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {agents.slice(0, 4).map(agent => {
                        const w = agent.wallet || {};
                        return (
                            <div key={agent.id} className="hover-glow" style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 2 }}>
                                    <div className={agent.status === 'active' ? 'animate-pulse-glow' : ''} style={{
                                        width: '40px', height: '40px', borderRadius: '10px',
                                        background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Bot size={20} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0 }}>{agent.name}</h4>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                                                {agent.strategy}
                                            </span>
                                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{agent.asset}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Win Rate</div>
                                    <div className="mono" style={{ fontSize: '14px', fontWeight: 600, color: (w.winRate || 0) >= 50 ? 'var(--accent-green)' : 'var(--accent-gold)' }}>
                                        {w.winRate || 0}%
                                    </div>
                                </div>

                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Portfolio</div>
                                    <div className="mono" style={{ fontSize: '14px', fontWeight: 500 }}>{formatCurrency(w.totalValue || agent.capital)}</div>
                                </div>

                                <div style={{ flex: 1, textAlign: 'right' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>PnL</div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                        <span className="mono" style={{ fontWeight: 600 }}>{formatCurrency(w.pnl || 0)}</span>
                                        <span className={(w.pnlPct || 0) >= 0 ? 'text-green' : 'text-red'} style={{ fontSize: '13px', fontWeight: 600 }}>
                                            {formatPercentage(w.pnlPct || 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
