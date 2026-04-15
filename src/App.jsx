import React, { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { BarChart3, Search, GitCompare, Briefcase, Menu, X, Globe } from 'lucide-react';
import { useLang } from './hooks/useLang';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Compare from './pages/Compare';
import Portfolio from './pages/Portfolio';

export default function App() {
  const { lang, toggle, t } = useLang();
  const [collapsed, setCollapsed] = useState(false);

  const NAV = [
    { to: '/', icon: BarChart3, label: t('nav_dashboard') },
    { to: '/catalog', icon: Search, label: t('nav_catalog') },
    { to: '/compare', icon: GitCompare, label: t('nav_compare') },
    { to: '/portfolio', icon: Briefcase, label: t('nav_portfolio') },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{
        width: collapsed ? 60 : 200, background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)' }}>
          {!collapsed && <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>{t('nav_title')}</span>}
          <button onClick={() => setCollapsed(c => !c)} style={{ background: 'none', color: 'var(--text-muted)', padding: 4 }}>
            {collapsed ? <Menu size={18}/> : <X size={18}/>}
          </button>
        </div>
        <div style={{ flex: 1, padding: '8px 0' }}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '12px 0' : '10px 16px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
              borderRight: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none', transition: 'all 0.15s',
            })}>
              <n.icon size={18}/>{!collapsed && <span>{n.label}</span>}
            </NavLink>
          ))}
        </div>
        {!collapsed && <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
          {t('nav_footer1')}<br/>{t('nav_footer2')}
        </div>}
      </nav>
      <main style={{ flex: 1, minWidth: 0 }}>
        {/* Top bar with language toggle */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
          padding: '10px 32px 0', position: 'sticky', top: 0, zIndex: 50,
        }}>
          <button onClick={toggle} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: 'var(--accent)', borderRadius: 99, padding: '5px 14px',
            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
            boxShadow: '0 2px 8px rgba(0,0,0,.2)',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <Globe size={14}/>
            {lang === 'zh' ? 'EN' : '中文'}
          </button>
        </div>
        <div style={{ padding: '8px 32px 24px', maxWidth: 1400 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/portfolio" element={<Portfolio />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
