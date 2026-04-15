import React from 'react';
import { useETFData } from '../hooks/useETFData';
import { useLang } from '../hooks/useLang';
import { CATEGORY_COLORS, formatPercent } from '../utils/format';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis, CartesianGrid } from 'recharts';
import { TrendingUp, DollarSign, Layers, PieChart } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, sub, color = 'var(--accent)' }) => (
  <div className="card" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
    <div style={{ width: 42, height: 42, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{value}</div>
      {sub && <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{sub}</div>}
    </div>
  </div>
);

export default function Dashboard() {
  const { market, categoryStats, etfList } = useETFData();
  const { t, sc } = useLang();

  const barData = categoryStats.map(c => ({
    name: sc(c.category), avgReturn: +c.avgReturn.toFixed(2), avgYield: +c.avgYield.toFixed(2), color: CATEGORY_COLORS[c.category],
  })).filter(d => d.avgReturn !== 0);

  const scatterData = etfList.filter(e => e._totalReturn != null && e._yield != null).map(e => ({
    x: e._yield, y: e._totalReturn, z: Math.max(e._aum / 1e9, 0.5),
    name: e['代码'], cat: sc(e['类别']), color: CATEGORY_COLORS[e['类别']],
  }));

  return <div>
    <h1 className="page-title">{t('dash_title')}</h1>
    <p className="page-subtitle">{t('dash_sub')}</p>
    <div className="grid-4" style={{ marginBottom: 24 }}>
      <StatCard icon={DollarSign} label={t('dash_stat1')} value={market.report_coverage} sub={t('dash_stat1_sub')} />
      <StatCard icon={Layers} label={t('dash_stat2')} value={market.traditional_dividend} color="var(--green)" />
      <StatCard icon={TrendingUp} label={t('dash_stat3')} value={market.options_strategy} color="var(--purple)" />
      <StatCard icon={PieChart} label={t('dash_stat4')} value={market.preferred_reit_mlp} color="var(--orange)" />
    </div>
    <div className="grid-2" style={{ marginBottom: 24 }}>
      <div className="card">
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>{t('dash_chart1')}</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={barData} layout="vertical" margin={{ left: 60, right: 20 }}>
            <XAxis type="number" tickFormatter={v => v + '%'} style={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" style={{ fontSize: 11 }} width={60} />
            <Tooltip formatter={v => v + '%'} contentStyle={{ background: '#1a2236', border: '1px solid #2a3550', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="avgReturn" name={t('chart_ann_total')} radius={[0, 4, 4, 0]}>{barData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.85} />)}</Bar>
            <Bar dataKey="avgYield" name={t('chart_yield')} radius={[0, 4, 4, 0]}>{barData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.35} />)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="card">
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>{t('dash_chart2')}</h3>
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ left: 10, right: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis type="number" dataKey="x" name={t('chart_yield_label')} unit="%" style={{ fontSize: 11 }} />
            <YAxis type="number" dataKey="y" name={t('chart_ann_total_label')} unit="%" style={{ fontSize: 11 }} />
            <ZAxis type="number" dataKey="z" range={[20, 400]} />
            <Tooltip content={({ payload }) => {
              if (!payload?.length) return null; const d = payload[0].payload;
              return <div style={{ background: '#1a2236', border: '1px solid #2a3550', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.name} <span style={{ color: 'var(--text-muted)' }}>{d.cat}</span></div>
                <div>{t('chart_yield_label')}: {d.x?.toFixed(2)}%</div><div>{t('chart_ann_total_label')}: {d.y?.toFixed(2)}%</div>
              </div>;
            }} />
            <Scatter data={scatterData}>{scatterData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.7} />)}</Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="card">
      <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>{t('dash_table_title')}</h3>
      <div style={{ overflowX: 'auto' }}>
        <table><thead><tr>
          <th>{t('dash_th_cat')}</th><th>{t('dash_th_count')}</th><th>{t('dash_th_valid')}</th><th>{t('dash_th_aum')}</th><th>{t('dash_th_avgyld')}</th><th>{t('dash_th_avgret')}</th>
        </tr></thead><tbody>
          {categoryStats.map(c => <tr key={c.category}>
            <td><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: CATEGORY_COLORS[c.category], marginRight: 8 }} />{sc(c.category)}</td>
            <td className="mono">{c.count}</td><td className="mono">{c.dataCount}</td>
            <td className="mono">${(c.totalAUM / 1e9).toFixed(1)}B</td><td className="mono">{c.avgYield.toFixed(2)}%</td>
            <td className={`mono ${c.avgReturn >= 0 ? 'positive' : 'negative'}`}>{formatPercent(c.avgReturn)}</td>
          </tr>)}
        </tbody></table>
      </div>
    </div>
  </div>;
}
