export const parsePercent = (val) => {
  if (val == null || val === '' || val === '-' || val === 'nan') return null;
  const s = String(val).replace('%', '').trim();
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
};

export const formatPercent = (val) => {
  const n = parsePercent(val);
  if (n == null) return '—';
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
};

export const formatAUM = (val) => {
  if (!val) return '—';
  return String(val);
};

export const colorClass = (val) => {
  const n = parsePercent(val);
  if (n == null) return '';
  return n >= 0 ? 'positive' : 'negative';
};

export const parseAUMToNumber = (val) => {
  if (!val) return 0;
  const s = String(val).replace('$', '').trim();
  if (s.endsWith('T')) return parseFloat(s) * 1e12;
  if (s.endsWith('B')) return parseFloat(s) * 1e9;
  if (s.endsWith('M')) return parseFloat(s) * 1e6;
  return parseFloat(s) || 0;
};

export const CATEGORY_COLORS = {
  '高股息ETF': '#22d3ee',
  '股息增长ETF': '#34d399',
  '期权金策略ETF-指数型': '#a78bfa',
  '期权金策略ETF-单股型': '#f87171',
  '期权金策略ETF-组合/FOF型': '#fb923c',
  '期权金策略ETF-0DTE型': '#fbbf24',
  '期权金策略ETF-行业/主题型': '#60a5fa',
  '期权金策略ETF-加密资产型': '#c084fc',
  'REIT ETF': '#2dd4bf',
  '优先股ETF': '#93c5fd',
  'MLP/能源基础设施ETF': '#fdba74',
};

export const SHORT_CAT = {
  '高股息ETF': '高股息',
  '股息增长ETF': '股息增长',
  '期权金策略ETF-指数型': '期权-指数',
  '期权金策略ETF-单股型': '期权-单股',
  '期权金策略ETF-组合/FOF型': '期权-FOF',
  '期权金策略ETF-0DTE型': '0DTE',
  '期权金策略ETF-行业/主题型': '行业主题',
  '期权金策略ETF-加密资产型': '加密资产',
  'REIT ETF': 'REIT',
  '优先股ETF': '优先股',
  'MLP/能源基础设施ETF': 'MLP能源',
};
