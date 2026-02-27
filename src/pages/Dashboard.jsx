import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart as RechartsPieChart, Pie, Cell, Legend
} from 'recharts';
import { Bot, Zap } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { portfolioStats, assetAllocation, portfolioHistory, activeAgents } from '../data/mockData';
import { formatCurrency, formatPercentage } from '../utils/formatters';

const Dashboard = () => {
    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div className="flex-between">
                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Welcome back! Your AI agents are actively monitoring the markets.</p>
                </div>
                <button className="hover-glow" style={{
                    background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <Zap size={18} />
                    Deploy New Agent
                </button>
            </div>

            {/* Metrics Row */}
            <div style={{ display: 'flex', gap: '24px' }}>
                <MetricCard
                    title="Total Portfolio Value"
                    value={formatCurrency(portfolioStats.totalValue)}
                    type="neutral"
                />
                <MetricCard
                    title="24h Profit / Loss"
                    value={formatCurrency(portfolioStats.dailyPnL)}
                    percentage={portfolioStats.dailyPnLPercentage}
                />
                <MetricCard
                    title="Active Agents"
                    value={portfolioStats.activeAgents}
                    type="neutral"
                />
                <MetricCard
                    title="AI Win Rate"
                    value={`${portfolioStats.winRate}%`}
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
                            <AreaChart data={portfolioHistory}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.5} />
                                        <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis
                                    stroke="var(--text-secondary)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value / 1000}k`}
                                    domain={['dataMin - 5000', 'dataMax + 5000']}
                                />
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="var(--accent-cyan)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Allocation Chart */}
                <div className="glass-panel" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '24px' }}>Asset Allocation</h3>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie
                                    data={assetAllocation}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {assetAllocation.map((entry, index) => (
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
                    </div>
                </div>
            </div>

            {/* AI Agents Table/List */}
            <div className="glass-panel" style={{ padding: '24px' }}>
                <div className="flex-between" style={{ marginBottom: '20px' }}>
                    <h3>Top Performing Agents</h3>
                    <button style={{
                        background: 'transparent', color: 'var(--accent-blue)',
                        border: 'none', cursor: 'pointer', fontWeight: 600
                    }}>View All</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {activeAgents.slice(0, 3).map(agent => (
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
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Runtime</div>
                                <div style={{ fontSize: '14px', fontWeight: 500 }}>{agent.runtime}</div>
                            </div>

                            <div style={{ flex: 1, textAlign: 'right' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total PnL</div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                    <span className="mono" style={{ fontWeight: 600 }}>{formatCurrency(agent.pnl)}</span>
                                    <span className={agent.pnlPercentage >= 0 ? 'text-green' : 'text-red'} style={{ fontSize: '13px', fontWeight: 600 }}>
                                        {formatPercentage(agent.pnlPercentage)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
