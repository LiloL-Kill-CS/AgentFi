import React, { useState, useEffect } from 'react';
import { Bot, Play, Pause, Settings, Plus, BarChart2, DollarSign, TrendingUp, TrendingDown, Wallet, RefreshCw } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { agentsAPI } from '../services/api';

const Agents = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalAUM, setTotalAUM] = useState(0);

    const fetchAgents = async () => {
        const result = await agentsAPI.list();
        if (result && result.agents) {
            setAgents(result.agents);
            const aum = result.agents.reduce((sum, a) => sum + (a.wallet?.totalValue || a.capital), 0);
            setTotalAUM(aum);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAgents();
        const interval = setInterval(fetchAgents, 5000); // refresh every 5s
        return () => clearInterval(interval);
    }, []);

    const handleToggle = async (agentId) => {
        await agentsAPI.toggle(agentId);
        fetchAgents();
    };

    const totalPnl = agents.reduce((sum, a) => sum + (a.wallet?.pnl || 0), 0);
    const totalTrades = agents.reduce((sum, a) => sum + (a.wallet?.tradesCount || 0), 0);

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>

            {/* Header */}
            <div className="flex-between">
                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>AI Trading Agents</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Each agent is trading with virtual currency using real market data.</p>
                </div>
                <button className="hover-glow animate-pulse-glow" style={{
                    background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                    color: '#fff', border: 'none', padding: '12px 24px',
                    borderRadius: '12px', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
                }}>
                    <Plus size={18} />
                    Create New Agent
                </button>
            </div>

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Wallet size={22} color="var(--accent-blue)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total AUM</div>
                        <div className="mono" style={{ fontSize: '20px', fontWeight: 700 }}>{formatCurrency(totalAUM)}</div>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: totalPnl >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {totalPnl >= 0 ? <TrendingUp size={22} color="var(--accent-green)" /> : <TrendingDown size={22} color="var(--accent-red)" />}
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Combined PnL</div>
                        <div className={`mono ${totalPnl >= 0 ? 'text-green' : 'text-red'}`} style={{ fontSize: '20px', fontWeight: 700 }}>{formatCurrency(totalPnl)}</div>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bot size={22} color="var(--accent-purple)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Active Agents</div>
                        <div className="mono" style={{ fontSize: '20px', fontWeight: 700 }}>{agents.filter(a => a.status === 'active').length} / {agents.length}</div>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <RefreshCw size={22} color="var(--accent-cyan)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Trades</div>
                        <div className="mono" style={{ fontSize: '20px', fontWeight: 700 }}>{totalTrades}</div>
                    </div>
                </div>
            </div>

            {/* Agents Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading simulation data...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
                    {agents.map(agent => {
                        const w = agent.wallet || {};
                        const positions = w.positions || {};
                        const posEntries = Object.entries(positions);
                        return (
                            <div key={agent.id} className="glass-panel transition-all" style={{
                                padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
                                position: 'relative', overflow: 'hidden'
                            }}>
                                {/* Glowing top line */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                                    background: agent.status === 'active' ? 'var(--accent-green)' : 'var(--accent-gold)',
                                    boxShadow: `0 0 10px ${agent.status === 'active' ? 'var(--accent-green)' : 'var(--accent-gold)'}`
                                }} />

                                {/* Agent Header */}
                                <div className="flex-between">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: agent.status === 'active' ? 'var(--accent-green)' : 'var(--text-secondary)'
                                        }}>
                                            <Bot size={24} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '18px' }}>{agent.name}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                                <div style={{
                                                    width: '6px', height: '6px', borderRadius: '50%',
                                                    background: agent.status === 'active' ? 'var(--accent-green)' : 'var(--accent-gold)',
                                                }} className={agent.status === 'active' ? 'animate-pulse-glow' : ''} />
                                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                                                    {agent.status} • {agent.runtime}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', padding: '4px 10px', borderRadius: '12px', fontWeight: 500 }}>
                                        {agent.strategy}
                                    </span>
                                    <span style={{ fontSize: '12px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                                        {agent.asset}
                                    </span>
                                </div>

                                {/* Wallet Stats */}
                                <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '12px', padding: '16px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Portfolio</div>
                                            <div className="mono" style={{ fontSize: '16px', fontWeight: 600 }}>{formatCurrency(w.totalValue || agent.capital)}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>PnL</div>
                                            <div className={`mono ${(w.pnl || 0) >= 0 ? 'text-green' : 'text-red'}`} style={{ fontSize: '16px', fontWeight: 600 }}>
                                                {(w.pnl || 0) >= 0 ? '+' : ''}{formatCurrency(w.pnl || 0)}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Win Rate</div>
                                            <div className="mono" style={{ fontSize: '16px', fontWeight: 600, color: (w.winRate || 0) >= 50 ? 'var(--accent-green)' : 'var(--accent-gold)' }}>
                                                {w.winRate || 0}%
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        <span>Cash: {formatCurrency(w.cash || agent.capital)}</span>
                                        <span>{w.tradesCount || 0} trades ({w.wins || 0}W / {w.losses || 0}L)</span>
                                    </div>
                                </div>

                                {/* Open Positions */}
                                {posEntries.length > 0 && (
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>OPEN POSITIONS</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {posEntries.map(([sym, pos]) => (
                                                <div key={sym} style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '8px 12px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', fontSize: '13px'
                                                }}>
                                                    <div>
                                                        <span style={{ fontWeight: 600, marginRight: '8px' }}>{sym}</span>
                                                        <span className="mono" style={{ color: 'var(--text-secondary)' }}>{pos.qty.toFixed(4)}</span>
                                                    </div>
                                                    <div className={`mono ${pos.unrealizedPnl >= 0 ? 'text-green' : 'text-red'}`} style={{ fontWeight: 600 }}>
                                                        {pos.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(pos.unrealizedPnl)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Last Trade */}
                                {w.lastTrade && w.lastTrade.success && (
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '8px 12px', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Last: <span style={{ color: w.lastTrade.action === 'BUY' ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>{w.lastTrade.action}</span> {w.lastTrade.symbol}</span>
                                        <span className="mono">{formatCurrency(w.lastTrade.value)}</span>
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                                    <button onClick={() => handleToggle(agent.id)} style={{
                                        flex: 1, padding: '10px', borderRadius: '8px',
                                        background: agent.status === 'active' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                        color: agent.status === 'active' ? 'var(--accent-gold)' : 'var(--accent-green)',
                                        border: `1px solid ${agent.status === 'active' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 600
                                    }}>
                                        {agent.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                                        {agent.status === 'active' ? 'Pause' : 'Start'}
                                    </button>
                                    <button style={{
                                        width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px',
                                        color: 'var(--text-secondary)', cursor: 'pointer'
                                    }} className="hover-glow">
                                        <BarChart2 size={16} />
                                    </button>
                                    <button style={{
                                        width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px',
                                        color: 'var(--text-secondary)', cursor: 'pointer'
                                    }} className="hover-glow">
                                        <Settings size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Create template card */}
                    <div style={{
                        border: '2px dashed var(--border-color)', borderRadius: '16px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: '16px', padding: '40px', minHeight: '260px', cursor: 'pointer',
                        background: 'rgba(255,255,255,0.01)', transition: 'all 0.3s'
                    }} className="hover-glow"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent-blue)';
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                        }}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%',
                            background: 'var(--bg-secondary)', border: '1px solid var(--accent-blue)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)'
                        }}>
                            <Plus size={30} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ marginBottom: '8px' }}>Create New Agent</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Deploy a new bot with virtual funds to test your strategy.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Agents;
