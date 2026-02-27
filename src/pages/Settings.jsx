import React from 'react';
import { User, Shield, CreditCard, Bell, Key, Moon, Sun, Smartphone } from 'lucide-react';

const Settings = () => {
    return (
        <div className="animate-fade-in" style={{ display: 'flex', gap: '32px', height: '100%' }}>

            {/* Settings Navigation Sidebar */}
            <div className="glass-panel" style={{ width: '250px', padding: '24px 0', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ padding: '0 24px', marginBottom: '24px', fontSize: '20px' }}>Settings</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {[
                        { id: 'profile', icon: <User size={18} />, label: 'Profile' },
                        { id: 'security', icon: <Shield size={18} />, label: 'Security & API Keys', active: true },
                        { id: 'billing', icon: <CreditCard size={18} />, label: 'Billing' },
                        { id: 'notifications', icon: <Bell size={18} />, label: 'Notifications' },
                        { id: 'appearance', icon: <Moon size={18} />, label: 'Appearance' },
                    ].map(tab => (
                        <button key={tab.id} style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '12px 24px', background: tab.active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                            border: 'none', borderRight: tab.active ? '3px solid var(--accent-blue)' : '3px solid transparent',
                            color: tab.active ? '#fff' : 'var(--text-secondary)',
                            cursor: 'pointer', textAlign: 'left', fontWeight: tab.active ? 600 : 500,
                            transition: 'all 0.2s'
                        }}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Settings Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>

                {/* Exchange APIs Section */}
                <div className="glass-panel" style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Key size={20} color="var(--accent-purple)" />
                        Exchange API Connections
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
                        Connect your exchange accounts for AgentFi to execute automated trades. Keys are encrypted end-to-end.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { name: 'Binance', logo: 'B', status: 'Connected', color: 'var(--accent-gold)' },
                            { name: 'Coinbase Pro', logo: 'C', status: 'Not Connected', color: 'var(--accent-blue)' },
                            { name: 'Alpaca (Stocks)', logo: 'A', status: 'Connected', color: 'var(--accent-green)' }
                        ].map(exchange => (
                            <div key={exchange.name} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '16px', border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '12px', background: 'rgba(0,0,0,0.2)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: exchange.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {exchange.logo}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{exchange.name}</div>
                                        <div style={{ fontSize: '12px', color: exchange.status === 'Connected' ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                                            {exchange.status}
                                        </div>
                                    </div>
                                </div>
                                <button className="hover-glow" style={{
                                    padding: '8px 16px', borderRadius: '6px',
                                    background: exchange.status === 'Connected' ? 'rgba(239, 68, 68, 0.1)' : 'var(--accent-blue)',
                                    color: exchange.status === 'Connected' ? 'var(--accent-red)' : '#fff',
                                    border: exchange.status === 'Connected' ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
                                    cursor: 'pointer', fontWeight: 600
                                }}>
                                    {exchange.status === 'Connected' ? 'Disconnect' : 'Connect'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Global Risk Management */}
                <div className="glass-panel" style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield size={20} color="var(--accent-green)" />
                        Global Risk Controls
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
                        Set global safety limits that override individual AI agent configurations.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 500, marginBottom: '4px' }}>Maximum Daily Drawdown</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Pause all agents if portfolio drops by this amount in 24h.</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input type="range" min="1" max="20" defaultValue="5" style={{ width: '150px' }} />
                                <span className="mono" style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '6px' }}>5.0%</span>
                            </div>
                        </div>

                        <div style={{ height: '1px', background: 'var(--border-color)' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 500, marginBottom: '4px' }}>Require 2FA for Trade Execution over $10k</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Send approval push notification to mobile device.</div>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <div style={{ width: '48px', height: '24px', background: 'var(--accent-green)', borderRadius: '12px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', width: '20px', height: '20px', background: 'white', borderRadius: '50%', top: '2px', right: '2px' }} />
                                </div>
                            </label>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Settings;
