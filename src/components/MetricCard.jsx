import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, value, percentage, type }) => {
    const isPositive = percentage >= 0;
    // Let type 'neutral' omit the up/down color if not a percentage trend
    const colorClass = type === 'neutral' ? '' : (isPositive ? 'text-green' : 'text-red');

    return (
        <div className="glass-panel hover-glow animate-fade-in" style={{ padding: '24px', flex: 1 }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>
                {title}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <h2 className="mono" style={{ fontSize: '28px', margin: 0 }}>{value}</h2>
                {percentage !== undefined && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '14px',
                        fontWeight: 600,
                        background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '20px'
                    }} className={colorClass}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {Math.abs(percentage)}%
                    </div>
                )}
            </div>
        </div>
    );
};

export default MetricCard;
