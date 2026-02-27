import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    LineChart,
    PieChart,
    Bot,
    MessageSquare,
    Settings,
    Activity
} from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Markets', path: '/markets', icon: <LineChart size={20} /> },
        { name: 'Portfolio', path: '/portfolio', icon: <PieChart size={20} /> },
        { name: 'AI Agents', path: '/agents', icon: <Bot size={20} /> },
        { name: 'AI Chat', path: '/chat', icon: <MessageSquare size={20} /> },
        { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
    ];

    return (
        <aside style={{
            width: 'var(--sidebar-width)',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            borderRight: '1px solid var(--border-color)',
            padding: '24px 0',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
            background: 'rgba(10, 14, 26, 0.8)',
            backdropFilter: 'blur(20px)'
        }}>
            {/* Logo */}
            <div style={{ padding: '0 24px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="flex-center animate-pulse-glow" style={{
                    width: '36px', height: '36px',
                    background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                    borderRadius: '10px',
                    color: 'white'
                }}>
                    <Activity size={20} />
                </div>
                <h1 style={{ fontSize: '22px', background: '-webkit-linear-gradient(#fff, #9cq)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    AgentFi
                </h1>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            color: isActive ? '#fff' : 'var(--text-secondary)',
                            background: isActive ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, transparent 100%)' : 'transparent',
                            borderLeft: isActive ? '3px solid var(--accent-blue)' : '3px solid transparent',
                            textDecoration: 'none',
                            fontWeight: isActive ? 600 : 500,
                            transition: 'all 0.2s',
                            boxShadow: isActive ? 'inset 0 0 20px rgba(59,130,246,0.05)' : 'none'
                        })}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Status */}
            <div style={{ padding: '0 24px' }}>
                <div style={{
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{
                        width: '36px', height: '36px',
                        borderRadius: '50%',
                        background: 'var(--accent-cyan)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: '#000'
                    }}>
                        L
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>Lilo L.</div>
                        <div style={{ fontSize: '12px', color: 'var(--accent-green)' }}>Pro Plan</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
