import React from 'react';
import { marketTickerData } from '../data/mockData';
import { formatCurrency, formatPercentage } from '../utils/formatters';

const MarketTicker = () => {
    return (
        <div style={{
            height: '40px',
            background: 'rgba(0,0,0,0.5)',
            borderBottom: '1px solid var(--border-color)',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap'
        }}>
            <div className="ticker-scroll">
                {[...marketTickerData, ...marketTickerData].map((item, index) => {
                    const isPositive = item.change >= 0;
                    return (
                        <div key={`${item.symbol}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 24px', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ fontWeight: 600, fontSize: '13px' }}>{item.symbol}</span>
                            <span className="mono" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{formatCurrency(item.price)}</span>
                            <span className="mono" style={{ color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '13px' }}>
                                {formatPercentage(item.change)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MarketTicker;
