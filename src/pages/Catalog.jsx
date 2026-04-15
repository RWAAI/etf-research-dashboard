import React, { useState, useMemo } from 'react';
import { useETFData } from '../hooks/useETFData';
import { useLang } from '../hooks/useLang';
import { formatPercent, colorClass, CATEGORY_COLORS, formatAUM } from '../utils/format';
import { Search, X, ArrowUpDown } from 'lucide-react';

function DetailModal({ etf, onClose, t, sc, lang }) {
  if (!etf) return null;
  const nameField = lang === 'en' ? (etf.en_name || etf['基金名称']) : etf['中文名称'];
  const rows = [
    [t('det_fund_name'), etf.en_name || etf['基金名称']],
    [t('det_cn_name'), etf['中文名称']],
    [t('det_category'), sc(etf['类别'])],
    ['AUM', etf['规模']],
    [t('det_fee'), etf['费率']],
    [t('det_yield'), etf['股息率']],
    [t('det_freq'), etf['分红频率']],
    [t('det_inception'), etf.inception],
    [t('det_volume'), etf.volume],
    [t('det_period'), etf['统计期(月)']],
  ];
  const perf = [
    [t('det_cum_total'), etf['累计总收益%']], [t('det_cum_price'), etf['累计价格变动%']], [t('det_cum_div'), etf['累计分红收益%']],
    [t('det_ann_total'), etf['年化总收益%']], [t('det_ann_price'), etf['年化价格变动%']], [t('det_ann_div'), etf['年化分红收益%']],
  ];
  const tax = etf.tax_nature ? [
    [t('det_tax_nature'), etf.tax_nature], [t('det_roc'), etf.roc_ratio],
    [t('det_wht'), etf.wht_ratio], [t('det_tax_level'), etf.tax_level],
  ] : [];

  const Section = ({ title, items, highlight }) => (
    <div style={{ marginBottom: 20 }}>
      <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border-light)', borderRadius: 8, overflow: 'hidden' }}>
        {items.map(([k, v], i) => (
          <div key={i} style={{ background: 'var(--bg-secondary)', padding: '8px 12px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{k}</div>
            <div className={highlight ? `mono ${colorClass(v)}` : 'mono'} style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              {highlight ? formatPercent(v) : (v || '—')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, width: 560, maxHeight: '85vh', overflow: 'auto', padding: 28 }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)', marginRight: 10 }}>{etf['代码']}</span>
            <span className="badge badge-accent">{sc(etf['类别'])}</span>
            {etf['短期标记'] && <span className="badge badge-yellow" style={{ marginLeft: 6 }}>{etf['短期标记']}</span>}
          </div>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <Section title={t('det_basic')} items={rows} />
        <Section title={t('det_perf')} items={perf} highlight />
        {tax.length > 0 && <Section title={t('det_tax')} items={tax} />}
      </div>
    </div>
  );
}

export default function Catalog() {
  const { etfList, categories } = useETFData();
  const { t, sc, lang } = useLang();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [freqFilter, setFreqFilter] = useState('all');
  const [sortKey, setSortKey] = useState('_aum');
  const [sortDir, setSortDir] = useState(-1);
  const [selected, setSelected] = useState(null);

  const freqOptions = useMemo(() => {
    const s = new Set(etfList.map(e => e['分红频率']).filter(Boolean));
    return [...s].sort();
  }, [etfList]);

  const filtered = useMemo(() => {
    let list = etfList;
    if (catFilter !== 'all') list = list.filter(e => e['类别'] === catFilter);
    if (freqFilter !== 'all') list = list.filter(e => e['分红频率'] === freqFilter);
    if (search) {
      const q = search.toUpperCase();
      list = list.filter(e => e['代码'].toUpperCase().includes(q) || (e['中文名称'] || '').includes(search) || (e['基金名称'] || '').toUpperCase().includes(q));
    }
    return [...list].sort((a, b) => ((a[sortKey] ?? -Infinity) - (b[sortKey] ?? -Infinity)) * sortDir);
  }, [etfList, catFilter, freqFilter, search, sortKey, sortDir]);

  const toggleSort = (key) => { if (sortKey === key) setSortDir(d => -d); else { setSortKey(key); setSortDir(-1); } };
  const SortTh = ({ label, field }) => (
    <th onClick={() => toggleSort(field)} style={{ cursor: 'pointer', userSelect: 'none' }}>
      <span className="flex items-center gap-2">{label} <ArrowUpDown size={12} style={{ opacity: sortKey === field ? 1 : 0.3 }} /></span>
    </th>
  );

  const getName = (e) => lang === 'en' ? (e.en_name || e['基金名称'] || e['中文名称']) : e['中文名称'];

  return <div>
    <h1 className="page-title">{t('cat_title')}</h1>
    <p className="page-subtitle">{t('cat_sub')}</p>
    <div className="flex gap-3 items-center flex-wrap" style={{ marginBottom: 20 }}>
      <div style={{ position: 'relative', flex: '0 0 260px' }}>
        <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('cat_search')} style={{ width: '100%', paddingLeft: 32 }} />
      </div>
      <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ minWidth: 160 }}>
        <option value="all">{t('cat_all')}</option>
        {categories.map(c => <option key={c} value={c}>{sc(c)}</option>)}
      </select>
      <select value={freqFilter} onChange={e => setFreqFilter(e.target.value)} style={{ minWidth: 120 }}>
        <option value="all">{t('cat_all_freq')}</option>
        {freqOptions.map(f => <option key={f} value={f}>{f}</option>)}
      </select>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('cat_count').replace('{n}', filtered.length)}</span>
    </div>
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
        <table><thead><tr>
          <th>{t('cat_th_code')}</th><th>{t('cat_th_name')}</th><th>{t('cat_th_cat')}</th>
          <SortTh label={t('cat_th_aum')} field="_aum" /><th>{t('cat_th_fee')}</th>
          <SortTh label={t('cat_th_yield')} field="_yield" /><th>{t('cat_th_freq')}</th>
          <SortTh label={t('cat_th_ann_total')} field="_totalReturn" />
          <SortTh label={t('cat_th_ann_price')} field="_priceReturn" />
          <SortTh label={t('cat_th_ann_div')} field="_divReturn" />
        </tr></thead><tbody>
          {filtered.map(e => (
            <tr key={e['代码']} onClick={() => setSelected(e)} style={{ cursor: 'pointer' }}>
              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)' }}>{e['代码']}</td>
              <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{getName(e)}</td>
              <td><span className="badge" style={{ background: CATEGORY_COLORS[e['类别']] + '20', color: CATEGORY_COLORS[e['类别']] }}>{sc(e['类别'])}</span></td>
              <td className="mono">{formatAUM(e['规模'])}</td><td className="mono">{e['费率'] || '—'}</td>
              <td className="mono">{e['股息率'] || '—'}</td><td style={{ fontSize: '0.75rem' }}>{e['分红频率']}</td>
              <td className={`mono ${colorClass(e['年化总收益%'])}`}>{formatPercent(e['年化总收益%'])}</td>
              <td className={`mono ${colorClass(e['年化价格变动%'])}`}>{formatPercent(e['年化价格变动%'])}</td>
              <td className={`mono ${colorClass(e['年化分红收益%'])}`}>{formatPercent(e['年化分红收益%'])}</td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </div>
    {selected && <DetailModal etf={selected} onClose={() => setSelected(null)} t={t} sc={sc} lang={lang} />}
  </div>;
}
