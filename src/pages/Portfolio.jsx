import React, { useState, useMemo } from 'react';
import { useETFData } from '../hooks/useETFData';
import { useLang } from '../hooks/useLang';
import { formatPercent, CATEGORY_COLORS } from '../utils/format';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend } from 'recharts';
import { Plus, X, Search, Trash2, Copy, Check } from 'lucide-react';

const PCOLORS = ['#22d3ee','#34d399','#a78bfa','#f87171','#fbbf24','#fb923c','#f472b6','#60a5fa','#2dd4bf','#c084fc'];
const PORT_COLORS = ['#22d3ee','#34d399','#a78bfa','#fb923c','#f472b6','#fbbf24'];

const DEFAULT_PORTFOLIOS = [
  { id:1, name:'rAI', holdings:[{t:'QQQI',w:75},{t:'NVDY',w:25}] },
  { id:2, name:'rSI', holdings:[{t:'SPYI',w:65},{t:'SCHD',w:25},{t:'JEPI',w:10}] },
  { id:3, name:'rENG', holdings:[{t:'AMLP',w:50},{t:'MLPX',w:25},{t:'VNQ',w:25}] },
];

function TickerSearch({ etfList, onAdd, exclude, placeholder }) {
  const [q,setQ]=useState(''); const [open,setOpen]=useState(false);
  const results = useMemo(()=>{ if(!q) return []; const s=q.toUpperCase(); return etfList.filter(e=>!exclude.has(e['代码'])&&e._totalReturn!=null&&(e['代码'].toUpperCase().includes(s)||(e['中文名称']||'').includes(q))).slice(0,8); },[q,etfList,exclude]);
  return <div style={{position:'relative',width:200}}>
    <div style={{position:'relative'}}><Search size={14} style={{position:'absolute',left:8,top:10,color:'var(--text-muted)'}}/><input value={q} onChange={e=>{setQ(e.target.value);setOpen(true)}} onFocus={()=>setOpen(true)} onBlur={()=>setTimeout(()=>setOpen(false),200)} placeholder={placeholder} style={{width:'100%',paddingLeft:28}}/></div>
    {open&&results.length>0&&<div style={{position:'absolute',top:'100%',left:0,right:0,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8,marginTop:4,zIndex:20,maxHeight:220,overflow:'auto'}}>
      {results.map(e=><div key={e['代码']} onMouseDown={()=>{onAdd(e['代码']);setQ('')}} style={{padding:'7px 12px',cursor:'pointer',fontSize:'.82rem',display:'flex',justifyContent:'space-between',borderBottom:'1px solid var(--border-light)'}} onMouseEnter={ev=>ev.currentTarget.style.background='var(--bg-card-hover)'} onMouseLeave={ev=>ev.currentTarget.style.background='transparent'}>
        <span><b style={{color:'var(--accent)',marginRight:8}}>{e['代码']}</b>{e['中文名称']}</span><span style={{color:'var(--text-muted)',fontSize:'.72rem'}}>{e['股息率']}</span>
      </div>)}
    </div>}
  </div>;
}

function calcPortfolio(holdings, etfMap) {
  const tot=holdings.reduce((s,h)=>s+h.w,0);
  if(!holdings.length||!tot) return null;
  const m={yld:0,fee:0,ct:0,cp:0,cd:0,at:0,ap:0,ad:0};
  holdings.forEach(h=>{ const e=etfMap[h.t]; if(!e) return; const w=h.w/tot;
    m.yld+=(e._yield??0)*w; m.fee+=(e._fee??0)*w; m.ct+=(e._cumTotal??0)*w; m.cp+=(e._cumPrice??0)*w; m.cd+=(e._cumDiv??0)*w; m.at+=(e._totalReturn??0)*w; m.ap+=(e._priceReturn??0)*w; m.ad+=(e._divReturn??0)*w;
  }); return m;
}

function MetricMini({label,value,colored=true}) {
  const n=parseFloat(value); const cls=colored&&!isNaN(n)?(n>=0?'positive':'negative'):'';
  return <div style={{background:'var(--bg-input)',borderRadius:6,padding:'6px 10px'}}>
    <div style={{color:'var(--text-muted)',fontSize:'.65rem',marginBottom:2}}>{label}</div>
    <div className={`mono ${cls}`} style={{fontSize:'.88rem',fontWeight:700}}>{isNaN(n)?'—':(colored&&n>=0?'+':'')+n.toFixed(2)+'%'}</div>
  </div>;
}

function PortfolioCard({port,idx,etfList,etfMap,onChange,onDelete,onDuplicate,canDelete,t,sc}) {
  const [editName,setEditName]=useState(false); const [tmpName,setTmpName]=useState(port.name);
  const color=PORT_COLORS[idx%PORT_COLORS.length];
  const excludeSet=useMemo(()=>new Set(port.holdings.map(h=>h.t)),[port.holdings]);
  const tot=port.holdings.reduce((s,h)=>s+h.w,0);
  const metrics=useMemo(()=>calcPortfolio(port.holdings,etfMap),[port.holdings,etfMap]);
  const updateH=hs=>onChange({...port,holdings:hs});
  const addT=tk=>{if(port.holdings.length>=10)return;updateH([...port.holdings,{t:tk,w:Math.floor(100/(port.holdings.length+1))}])};
  const rmT=tk=>updateH(port.holdings.filter(h=>h.t!==tk));
  const setW=(tk,w)=>updateH(port.holdings.map(h=>h.t===tk?{...h,w:Math.max(0,Math.min(100,w))}:h));
  const norm=()=>{if(!tot)return;updateH(port.holdings.map(h=>({...h,w:Math.round(h.w/tot*100)})))};
  const eq=()=>{const w=Math.floor(100/port.holdings.length);updateH(port.holdings.map((h,i)=>({...h,w:i===0?100-w*(port.holdings.length-1):w})))};
  const saveName=()=>{onChange({...port,name:tmpName});setEditName(false)};
  const pieData=port.holdings.map(h=>({name:h.t,value:h.w}));

  return <div className="card" style={{borderTop:`3px solid ${color}`,padding:0,overflow:'hidden'}}>
    <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border-light)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <div style={{width:10,height:10,borderRadius:3,background:color}}/>
        {editName?<div style={{display:'flex',gap:4,alignItems:'center'}}><input value={tmpName} onChange={e=>setTmpName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveName()} style={{fontSize:'.9rem',fontWeight:700,width:120,padding:'2px 6px'}} autoFocus/><Check size={15} style={{cursor:'pointer',color:'var(--green)'}} onClick={saveName}/></div>
        :<span style={{fontSize:'.9rem',fontWeight:700,cursor:'pointer'}} onClick={()=>{setTmpName(port.name);setEditName(true)}}>{port.name}</span>}
      </div>
      <div style={{display:'flex',gap:4}}>
        <button className="btn-outline" onClick={onDuplicate} style={{padding:'3px 6px',fontSize:'.7rem'}} title="Copy"><Copy size={12}/></button>
        {canDelete&&<button className="btn-outline" onClick={onDelete} style={{padding:'3px 6px',fontSize:'.7rem',borderColor:'var(--red)',color:'var(--red)'}} title="Delete"><Trash2 size={12}/></button>}
      </div>
    </div>
    <div style={{padding:'12px 16px'}}>
      {port.holdings.map((h,i)=>{const e=etfMap[h.t];return<div key={h.t} style={{display:'flex',alignItems:'center',gap:6,marginBottom:5,padding:'5px 8px',background:'var(--bg-secondary)',borderRadius:6,borderLeft:`3px solid ${PCOLORS[i%10]}`}}>
        <span style={{fontFamily:'var(--font-mono)',fontWeight:700,color:PCOLORS[i%10],width:42,fontSize:'.8rem'}}>{h.t}</span>
        <span style={{fontSize:'.68rem',color:'var(--text-muted)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e?.['中文名称']||''}</span>
        <input type="range" min={0} max={100} value={h.w} onChange={ev=>setW(h.t,+ev.target.value)} style={{width:60,accentColor:PCOLORS[i%10]}}/>
        <input type="number" min={0} max={100} value={h.w} onChange={ev=>setW(h.t,+ev.target.value)} style={{width:40,textAlign:'center',padding:'2px',fontSize:'.78rem'}}/>
        <span style={{color:'var(--text-muted)',fontSize:'.72rem'}}>%</span>
        <X size={13} style={{cursor:'pointer',color:'var(--text-muted)',flexShrink:0}} onClick={()=>rmT(h.t)}/>
      </div>})}
      <div style={{display:'flex',alignItems:'center',gap:6,marginTop:8,flexWrap:'wrap'}}>
        <TickerSearch etfList={etfList} onAdd={addT} exclude={excludeSet} placeholder={t('port_add_etf')}/>
        <button className="btn-outline" onClick={eq} style={{padding:'3px 7px',fontSize:'.68rem'}}>{t('port_equal')}</button>
        <button className="btn-outline" onClick={norm} style={{padding:'3px 7px',fontSize:'.68rem'}}>{t('port_norm')}</button>
        <span style={{fontFamily:'var(--font-mono)',fontSize:'.78rem',fontWeight:600,color:tot===100?'var(--green)':'var(--yellow)'}}>{tot}%</span>
      </div>
      {metrics&&<div style={{marginTop:14}}>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <div style={{width:110,height:110,flexShrink:0}}>
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} innerRadius={28} paddingAngle={2} strokeWidth={0}>{pieData.map((_,i)=><Cell key={i} fill={PCOLORS[i%10]}/>)}</Pie><Tooltip formatter={v=>v+'%'} contentStyle={{background:'#1a2236',border:'1px solid #2a3550',borderRadius:8,fontSize:11}}/></PieChart></ResponsiveContainer>
          </div>
          <div style={{flex:1,display:'grid',gridTemplateColumns:'1fr 1fr',gap:5}}>
            <MetricMini label={t('port_yield')} value={metrics.yld}/>
            <MetricMini label={t('port_fee')} value={metrics.fee} colored={false}/>
            <MetricMini label={t('port_ann_total')} value={metrics.at}/>
            <MetricMini label={t('port_ann_div')} value={metrics.ad}/>
            <MetricMini label={t('port_ann_price')} value={metrics.ap}/>
            <MetricMini label={t('port_cum_total')} value={metrics.ct}/>
          </div>
        </div>
      </div>}
    </div>
  </div>;
}

export default function Portfolio() {
  const {etfList}=useETFData();
  const {t,sc}=useLang();
  const etfMap=useMemo(()=>Object.fromEntries(etfList.map(e=>[e['代码'],e])),[etfList]);
  const [nextId,setNextId]=useState(4);
  const [portfolios,setPortfolios]=useState(DEFAULT_PORTFOLIOS);
  const addP=()=>{setPortfolios([...portfolios,{id:nextId,name:`Portfolio ${nextId}`,holdings:[]}]);setNextId(n=>n+1)};
  const updateP=(id,u)=>setPortfolios(portfolios.map(p=>p.id===id?u:p));
  const deleteP=id=>{if(portfolios.length<=1)return;setPortfolios(portfolios.filter(p=>p.id!==id))};
  const dupP=p=>{setPortfolios([...portfolios,{id:nextId,name:p.name+' (copy)',holdings:p.holdings.map(h=>({...h}))}]);setNextId(n=>n+1)};

  const allM=useMemo(()=>portfolios.map(p=>({...p,metrics:calcPortfolio(p.holdings,etfMap),total:p.holdings.reduce((s,h)=>s+h.w,0)})),[portfolios,etfMap]);
  const validP=allM.filter(p=>p.metrics);

  const compMetrics=[{k:'yld',l:t('port_w_yield')},{k:'fee',l:t('port_w_fee')},{k:'at',l:t('port_w_ann_total')},{k:'ap',l:t('port_w_ann_price')},{k:'ad',l:t('port_w_ann_div')},{k:'ct',l:t('port_w_cum_total')},{k:'cp',l:t('port_w_cum_price')},{k:'cd',l:t('port_w_cum_div')}];
  const barD=[{m:t('port_bar_yield'),k:'yld'},{m:t('port_bar_total'),k:'at'},{m:t('port_bar_price'),k:'ap'},{m:t('port_bar_div'),k:'ad'}].map(({m,k})=>{const o={metric:m};validP.forEach(p=>{o[p.name]=p.metrics[k]??0});return o});
  const radarD=useMemo(()=>{
    const ms=[{k:'yld',l:t('port_radar_yield')},{k:'at',l:t('port_radar_total')},{k:'ad',l:t('port_radar_div')},{k:'ct',l:t('port_radar_cum')},{k:'fee',l:t('port_radar_lowfee'),inv:true}];
    if(!validP.length)return [];
    const mx={};ms.forEach(m=>{mx[m.k]=Math.max(...validP.map(p=>Math.abs(p.metrics[m.k]??0)),0.01)});
    return ms.map(m=>{const o={metric:m.l};validP.forEach(p=>{let v=Math.abs(p.metrics[m.k]??0)/mx[m.k]*100;if(m.inv)v=100-v;o[p.name]=+Math.max(0,Math.min(100,v)).toFixed(1)});return o});
  },[validP,t]);

  const cols=Math.min(portfolios.length,3);

  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
      <div><h1 className="page-title">{t('port_title')}</h1><p className="page-subtitle">{t('port_sub')}</p></div>
      <button className="btn-primary" onClick={addP} style={{display:'flex',alignItems:'center',gap:6,marginTop:4}}><Plus size={16}/>{t('port_new')}</button>
    </div>
    <div style={{display:'grid',gridTemplateColumns:`repeat(${cols},1fr)`,gap:14,marginBottom:28}}>
      {portfolios.map((p,i)=><PortfolioCard key={p.id} port={p} idx={i} etfList={etfList} etfMap={etfMap} onChange={u=>updateP(p.id,u)} onDelete={()=>deleteP(p.id)} onDuplicate={()=>dupP(p)} canDelete={portfolios.length>1} t={t} sc={sc}/>)}
    </div>
    {validP.length>=2&&<>
      <h2 style={{fontSize:'1.1rem',fontWeight:700,marginBottom:16,borderTop:'1px solid var(--border)',paddingTop:20}}>{t('port_compare_title')}</h2>
      <div className="grid-2" style={{marginBottom:20}}>
        <div className="card">
          <h3 style={{fontSize:'.85rem',fontWeight:600,marginBottom:12}}>{t('port_chart1')}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barD} margin={{left:16}}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/><XAxis dataKey="metric" style={{fontSize:11}}/><YAxis tickFormatter={v=>v+'%'} style={{fontSize:11}}/><Tooltip formatter={v=>v?.toFixed(2)+'%'} contentStyle={{background:'#1a2236',border:'1px solid #2a3550',borderRadius:8,fontSize:12}}/>
              {validP.map((p,i)=><Bar key={p.name} dataKey={p.name} fill={PORT_COLORS[i%6]} fillOpacity={.8} radius={[3,3,0,0]}/>)}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{fontSize:'.85rem',fontWeight:600,marginBottom:12}}>{t('port_chart2')}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarD}><PolarGrid stroke="#2a3550"/><PolarAngleAxis dataKey="metric" style={{fontSize:11}} tick={{fill:'#94a3b8'}}/>
              {validP.map((p,i)=><Radar key={p.name} name={p.name} dataKey={p.name} stroke={PORT_COLORS[i%6]} fill={PORT_COLORS[i%6]} fillOpacity={.12} strokeWidth={2}/>)}
              <Legend wrapperStyle={{fontSize:12}}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card">
        <h3 style={{fontSize:'.88rem',fontWeight:600,marginBottom:14}}>{t('port_table')}</h3>
        <div style={{overflowX:'auto'}}><table>
          <thead><tr><th>{t('port_th_metric')}</th>{validP.map((p,i)=><th key={p.id} style={{color:PORT_COLORS[i%6]}}>{p.name}</th>)}</tr></thead>
          <tbody>
            <tr><td style={{fontWeight:600}}>{t('port_holdings')}</td>{validP.map(p=><td key={p.id} style={{fontFamily:'var(--font-mono)',fontSize:'.78rem'}}>{p.holdings.map(h=>h.t).join(' / ')}</td>)}</tr>
            <tr><td style={{fontWeight:600}}>{t('port_weights')}</td>{validP.map(p=><td key={p.id} style={{fontFamily:'var(--font-mono)',fontSize:'.78rem'}}>{p.holdings.map(h=>h.w+'%').join(' / ')}</td>)}</tr>
            {compMetrics.map(cm=><tr key={cm.k}><td style={{fontWeight:600}}>{cm.l}</td>{validP.map(p=>{const v=p.metrics[cm.k];const c=cm.k!=='fee';return<td key={p.id} className={`mono ${c?(v>=0?'positive':'negative'):''}`}>{(c&&v>=0?'+':'')+v.toFixed(2)+'%'}</td>})}</tr>)}
          </tbody>
        </table></div>
      </div>
    </>}
  </div>;
}
