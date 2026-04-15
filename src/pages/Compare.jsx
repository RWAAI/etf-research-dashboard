import React, { useState, useMemo } from 'react';
import { useETFData } from '../hooks/useETFData';
import { useLang } from '../hooks/useLang';
import { formatPercent, colorClass, CATEGORY_COLORS } from '../utils/format';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend } from 'recharts';
import { X, Search } from 'lucide-react';

const CC = ['#22d3ee', '#34d399', '#a78bfa', '#f87171', '#fbbf24', '#fb923c', '#f472b6', '#60a5fa'];

function TickerPicker({ etfList, onAdd, exclude, placeholder }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const results = useMemo(() => {
    if (!q) return [];
    const s = q.toUpperCase();
    return etfList.filter(e => !exclude.has(e['代码']) && (e['代码'].toUpperCase().includes(s) || (e['中文名称'] || '').includes(q))).slice(0, 8);
  }, [q, etfList, exclude]);
  return (
    <div style={{ position: 'relative', width: 220 }}>
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: 8, top: 10, color: 'var(--text-muted)' }} />
        <input value={q} onChange={e => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 200)} placeholder={placeholder} style={{ width: '100%', paddingLeft: 28, fontSize: '0.82rem' }} />
      </div>
      {open && results.length > 0 && <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, marginTop: 4, zIndex: 10, maxHeight: 240, overflow: 'auto' }}>
        {results.map(e => <div key={e['代码']} onMouseDown={() => { onAdd(e['代码']); setQ(''); }} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)' }} onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
          <span><strong style={{ color: 'var(--accent)', marginRight: 8 }}>{e['代码']}</strong>{e['中文名称']}</span>
        </div>)}
      </div>}
    </div>
  );
}

export default function Compare() {
  const { etfList } = useETFData();
  const { t, sc, lang } = useLang();
  const [tickers, setTickers] = useState(['JEPI', 'JEPQ', 'QQQI', 'SPYI']);
  const etfMap = useMemo(() => Object.fromEntries(etfList.map(e => [e['代码'], e])), [etfList]);
  const selected = tickers.map(t => etfMap[t]).filter(Boolean);
  const excludeSet = useMemo(() => new Set(tickers), [tickers]);
  const addTicker = (t) => { if (!tickers.includes(t) && tickers.length < 8) setTickers([...tickers, t]); };
  const removeTicker = (tk) => setTickers(tickers.filter(x => x !== tk));
  const getName = (e) => lang === 'en' ? (e.en_name || e['基金名称'] || e['中文名称']) : e['中文名称'];

  const barData = [
    { m: t('cmp_yield'), k: '_yield' }, { m: t('cmp_ann_total'), k: '_totalReturn' },
    { m: t('cmp_ann_price'), k: '_priceReturn' }, { m: t('cmp_ann_div'), k: '_divReturn' },
  ].map(({ m, k }) => { const o = { metric: m }; selected.forEach(e => { o[e['代码']] = e[k] ?? 0; }); return o; });

  const radarData = useMemo(() => {
    if (!selected.length) return [];
    const ms = [{ k: '_yield', l: t('radar_yield') }, { k: '_totalReturn', l: t('radar_total') }, { k: '_divReturn', l: t('radar_div') }, { k: '_aum', l: t('radar_aum') }, { k: '_fee', l: t('radar_lowfee'), inv: true }];
    const mx = {}; ms.forEach(m => { mx[m.k] = Math.max(...selected.map(e => Math.abs(e[m.k] ?? 0)), 1); });
    return ms.map(m => { const o = { metric: m.l }; selected.forEach(e => { let v = Math.abs(e[m.k] ?? 0) / mx[m.k] * 100; if (m.inv) v = 100 - v; o[e['代码']] = +Math.max(0, Math.min(100, v)).toFixed(1); }); return o; });
  }, [selected, t]);

  const compRows = [
    [t('cmp_aum'), e => e['规模'] || '—'],
    [t('cmp_fee'), e => e['费率'] || '—'],
    [t('cmp_yield'), e => e['股息率'] || '—'],
    [t('cmp_freq'), e => e['分红频率'] || '—'],
    [t('cmp_cum_total'), e => formatPercent(e['累计总收益%']), true],
    [t('cmp_cum_price'), e => formatPercent(e['累计价格变动%']), true],
    [t('cmp_cum_div'), e => formatPercent(e['累计分红收益%']), true],
    [t('cmp_ann_total'), e => formatPercent(e['年化总收益%']), true],
    [t('cmp_ann_price'), e => formatPercent(e['年化价格变动%']), true],
    [t('cmp_ann_div'), e => formatPercent(e['年化分红收益%']), true],
    [t('cmp_tax_nature'), e => e.tax_nature || '—'],
    [t('cmp_tax_roc'), e => e.roc_ratio || '—'],
    [t('cmp_tax_level'), e => e.tax_level || '—'],
  ];

  return <div>
    <h1 className="page-title">{t('cmp_title')}</h1>
    <p className="page-subtitle">{t('cmp_sub')}</p>
    <div className="flex gap-3 items-center flex-wrap" style={{ marginBottom: 20 }}>
      {tickers.map((tk, i) => <span key={tk} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: CC[i % 8] + '20', color: CC[i % 8], padding: '4px 10px', borderRadius: 99, fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{tk} <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeTicker(tk)} /></span>)}
      <TickerPicker etfList={etfList} onAdd={addTicker} exclude={excludeSet} placeholder={t('cmp_add')} />
    </div>
    {selected.length > 0 && <>
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>{t('cmp_chart1')}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ left: 16 }}>
              <XAxis dataKey="metric" style={{ fontSize: 11 }} /><YAxis tickFormatter={v => v + '%'} style={{ fontSize: 11 }} />
              <Tooltip formatter={v => v?.toFixed(2) + '%'} contentStyle={{ background: '#1a2236', border: '1px solid #2a3550', borderRadius: 8, fontSize: 12 }} />
              {selected.map((e, i) => <Bar key={e['代码']} dataKey={e['代码']} fill={CC[i % 8]} fillOpacity={0.8} radius={[3, 3, 0, 0]} />)}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>{t('cmp_chart2')}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}><PolarGrid stroke="#2a3550" /><PolarAngleAxis dataKey="metric" style={{ fontSize: 11 }} tick={{ fill: '#94a3b8' }} />
              {selected.map((e, i) => <Radar key={e['代码']} name={e['代码']} dataKey={e['代码']} stroke={CC[i % 8]} fill={CC[i % 8]} fillOpacity={0.15} strokeWidth={2} />)}
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card" style={{ overflow: 'auto' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>{t('cmp_table')}</h3>
        <table><thead><tr><th>{t('cmp_th_metric')}</th>{selected.map((e, i) => <th key={e['代码']} style={{ color: CC[i % 8] }}>{e['代码']}</th>)}</tr></thead><tbody>
          <tr><td style={{ fontWeight: 600 }}>{t('cmp_cn_name')}</td>{selected.map(e => <td key={e['代码']} style={{ fontSize: '0.78rem', whiteSpace: 'normal', maxWidth: 160 }}>{getName(e)}</td>)}</tr>
          <tr><td style={{ fontWeight: 600 }}>{t('cmp_category')}</td>{selected.map(e => <td key={e['代码']}><span className="badge" style={{ background: CATEGORY_COLORS[e['类别']] + '20', color: CATEGORY_COLORS[e['类别']] }}>{sc(e['类别'])}</span></td>)}</tr>
          {compRows.map(([label, fn, colored]) => <tr key={label}><td style={{ fontWeight: 600 }}>{label}</td>{selected.map(e => { const val = fn(e); return <td key={e['代码']} className={colored ? `mono ${val.startsWith('+') ? 'positive' : val.startsWith('-') ? 'negative' : ''}` : 'mono'}>{val}</td>; })}</tr>)}
        </tbody></table>
      </div>
    </>}
  </div>;
}
