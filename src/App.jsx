import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MarketTicker from './components/MarketTicker';
import Dashboard from './pages/Dashboard';

import Markets from './pages/Markets';
import Portfolio from './pages/Portfolio';
import Agents from './pages/Agents';
import AIChat from './pages/AIChat';
import Settings from './pages/Settings';

function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <MarketTicker />
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/chat" element={<AIChat />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
