import React, { useState } from 'react';
import { Send, User, Bot, Sparkles, TrendingUp, AlertCircle, RefreshCw, Wifi } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { chatAPI } from '../services/api';

const initialMessages = [
    {
        id: 1,
        sender: 'ai',
        text: "Hello! I'm connected to your live AI trading agents. I can show you what they're doing in real-time, their positions, recent trades, and PnL. Try asking 'What are my agents doing?' or 'Show recent trades'!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
];

const AIChat = () => {
    const [messages, setMessages] = useState(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isTyping) return;

        const userText = inputValue;
        const newUserMsg = {
            id: messages.length + 1,
            sender: 'user',
            text: userText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setIsTyping(true);

        // Call the real backend API
        const result = await chatAPI.send(userText);

        const newAiMsg = {
            id: messages.length + 2,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            ...(result
                ? { text: result.text, type: result.type, data: result.data }
                : { text: "I couldn't reach the backend right now. Please make sure the FastAPI server is running on port 8000.", type: 'text' }
            ),
        };

        setMessages(prev => [...prev, newAiMsg]);
        setIsTyping(false);
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles color="var(--accent-purple)" />
                    AI Financial Assistant
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <Wifi size={10} /> LIVE DATA
                    </span>
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Powered by real-time CoinGecko & Yahoo Finance data with AI technical analysis.</p>
            </div>

            {/* Chat Area */}
            <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
                <div className="glass-panel" style={{ flex: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {messages.map((msg) => (
                            <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                    background: msg.sender === 'user' ? 'var(--accent-cyan)' : 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: msg.sender === 'user' ? '#000' : '#fff',
                                    boxShadow: msg.sender === 'ai' ? '0 0 15px rgba(139, 92, 246, 0.4)' : 'none'
                                }}>
                                    {msg.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
                                </div>

                                <div style={{
                                    maxWidth: '75%',
                                    background: msg.sender === 'user' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                    border: `1px solid ${msg.sender === 'user' ? 'rgba(59, 130, 246, 0.3)' : 'var(--border-color)'}`,
                                    padding: '16px', borderRadius: '16px',
                                    borderTopRightRadius: msg.sender === 'user' ? 0 : '16px',
                                    borderTopLeftRadius: msg.sender === 'ai' ? 0 : '16px',
                                }}>
                                    <p style={{ lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>{msg.text}</p>

                                    {/* Real AI Analysis Card */}
                                    {msg.type === 'analysis' && msg.data && (
                                        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                            <div className="flex-between" style={{ marginBottom: '12px' }}>
                                                <span style={{ fontWeight: 600 }}>{msg.data.symbol}</span>
                                                <span className={`mono ${msg.data.signal?.includes('BUY') ? 'text-green' : msg.data.signal?.includes('SELL') ? 'text-red' : 'text-gold'}`} style={{ fontWeight: 700, fontSize: '16px' }}>
                                                    {msg.data.signal}
                                                </span>
                                            </div>
                                            <div style={{ marginBottom: '12px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>AI Confidence</div>
                                                <div className="mono" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-cyan)' }}>{msg.data.confidence}%</div>
                                            </div>
                                            {msg.data.indicators && (
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                                                    <div><span style={{ color: 'var(--text-secondary)' }}>RSI:</span> <span className={msg.data.indicators.rsi < 30 ? 'text-green' : msg.data.indicators.rsi > 70 ? 'text-red' : ''}>{msg.data.indicators.rsi}</span></div>
                                                    <div><span style={{ color: 'var(--text-secondary)' }}>SMA20:</span> <span>{formatCurrency(msg.data.indicators.sma20)}</span></div>
                                                    <div><span style={{ color: 'var(--text-secondary)' }}>Momentum:</span> <span className={msg.data.indicators.momentum > 0 ? 'text-green' : 'text-red'}>{msg.data.indicators.momentum}%</span></div>
                                                    <div><span style={{ color: 'var(--text-secondary)' }}>Volatility:</span> <span>{msg.data.indicators.volatility}%</span></div>
                                                    <div><span style={{ color: 'var(--text-secondary)' }}>Price:</span> <span className="mono">{formatCurrency(msg.data.indicators.currentPrice)}</span></div>
                                                    <div><span style={{ color: 'var(--text-secondary)' }}>EMA12:</span> <span>{formatCurrency(msg.data.indicators.ema12)}</span></div>
                                                </div>
                                            )}
                                            {msg.data.reason && (
                                                <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                                    {msg.data.reason}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Agents Report Card */}
                                    {msg.type === 'agents_report' && msg.data && (
                                        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                                <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total AUM</div>
                                                    <div className="mono" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-cyan)' }}>{formatCurrency(msg.data.totalValue)}</div>
                                                </div>
                                                <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Combined PnL</div>
                                                    <div className={`mono ${msg.data.totalPnl >= 0 ? 'text-green' : 'text-red'}`} style={{ fontSize: '16px', fontWeight: 700 }}>{formatCurrency(msg.data.totalPnl)}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {msg.data.agents.map((a, i) => (
                                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', fontSize: '13px' }}>
                                                        <div style={{ flex: 2 }}>
                                                            <div style={{ fontWeight: 600, marginBottom: '2px' }}>{a.name}</div>
                                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{a.strategy} • {a.positions}</div>
                                                        </div>
                                                        <div style={{ flex: 1, textAlign: 'center' }}>
                                                            <div className="mono" style={{ color: a.winRate >= 50 ? 'var(--accent-green)' : 'var(--accent-gold)' }}>{a.winRate}% WR</div>
                                                        </div>
                                                        <div style={{ flex: 1, textAlign: 'right' }}>
                                                            <div className={`mono ${a.pnl >= 0 ? 'text-green' : 'text-red'}`} style={{ fontWeight: 600 }}>
                                                                {a.pnl >= 0 ? '+' : ''}{formatCurrency(a.pnl)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {msg.data.recentTrades && msg.data.recentTrades.length > 0 && (
                                                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>RECENT TRADES</div>
                                                    {msg.data.recentTrades.slice(0, 4).map((t, i) => (
                                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', color: 'var(--text-secondary)' }}>
                                                            <span>{t.agent} <span style={{ color: t.action === 'BUY' ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>{t.action}</span> {t.symbol}</span>
                                                            <span className="mono">{formatCurrency(t.value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Trades List Card */}
                                    {msg.type === 'trades' && msg.data && (
                                        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                            {msg.data.trades.map((t, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < msg.data.trades.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', fontSize: '13px' }}>
                                                    <div style={{ flex: 2 }}>
                                                        <span style={{ fontWeight: 600, marginRight: '6px' }}>{t.agent}</span>
                                                        <span style={{ color: t.action === 'BUY' ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>{t.action}</span>
                                                        <span style={{ marginLeft: '6px' }}>{t.symbol}</span>
                                                    </div>
                                                    <div className="mono" style={{ flex: 1, textAlign: 'center' }}>{t.qty} @ {formatCurrency(t.price)}</div>
                                                    <div className="mono" style={{ flex: 1, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(t.value)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Portfolio Rebalance Card - now with real data */}
                                    {msg.type === 'rebalance' && msg.data && (
                                        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                                                <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Risk Score</div>
                                                    <div className="mono text-gold" style={{ fontSize: '18px', fontWeight: 700 }}>{msg.data.riskScore}</div>
                                                </div>
                                                <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Crypto</div>
                                                    <div className="mono text-purple" style={{ fontSize: '18px', fontWeight: 700 }}>{msg.data.cryptoExposure}%</div>
                                                </div>
                                                <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Stocks</div>
                                                    <div className="mono text-blue" style={{ fontSize: '18px', fontWeight: 700 }}>{msg.data.stockExposure}%</div>
                                                </div>
                                            </div>
                                            {msg.data.suggestions && msg.data.suggestions.length > 0 && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {msg.data.suggestions.map((s, i) => (
                                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                            <AlertCircle size={14} color={s.priority === 'high' ? 'var(--accent-red)' : 'var(--accent-gold)'} />
                                                            {s.message}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'right' }}>{msg.time}</div>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div className="animate-pulse-glow" style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                    <Bot size={20} />
                                </div>
                                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '16px', borderTopLeftRadius: 0, display: 'flex', gap: '4px' }}>
                                    <div style={{ width: '8px', height: '8px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'pulse-glow 1s infinite 0s' }} />
                                    <div style={{ width: '8px', height: '8px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'pulse-glow 1s infinite 0.2s' }} />
                                    <div style={{ width: '8px', height: '8px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'pulse-glow 1s infinite 0.4s' }} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
                        <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask about your agents, trades, or market... (e.g. 'What are my agents doing?')"
                                style={{ flex: 1, padding: '16px 20px', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '15px', outline: 'none' }}
                            />
                            <button type="submit" disabled={!inputValue.trim() || isTyping} className="hover-glow" style={{
                                width: '52px', height: '52px', borderRadius: '50%', border: 'none',
                                background: inputValue.trim() ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                                color: inputValue.trim() ? 'white' : 'var(--text-muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: inputValue.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.3s'
                            }}>
                                <Send size={20} style={{ marginLeft: '2px' }} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Quick Actions Sidebar */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                "What are my agents doing?",
                                "Show recent trades",
                                "Analyze BTC",
                                "Review my portfolio",
                                "Market overview",
                                "Suggest a strategy"
                            ].map((action, i) => (
                                <button key={i} onClick={() => setInputValue(action)} style={{
                                    padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px',
                                    color: 'var(--text-secondary)', textAlign: 'left', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px'
                                }} className="hover-glow">
                                    <TrendingUp size={14} color="var(--accent-cyan)" />
                                    {action}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>AI Capabilities</h3>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>🤖 <strong>Agent Monitor</strong> — Live status, positions & decisions</div>
                            <div>📊 <strong>Trade History</strong> — Real-time buy/sell activity</div>
                            <div>💼 <strong>Portfolio Review</strong> — Risk scores from live holdings</div>
                            <div>📈 <strong>Technical Analysis</strong> — RSI, SMA, EMA with agent exposure</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChat;
