import { useState, useMemo } from 'react';
import rawData from '../data/etfData.json';
import { parsePercent, parseAUMToNumber } from '../utils/format';

export function useETFData() {
  const { market, categories, etfs } = rawData;
  
  const etfList = useMemo(() => etfs.map(e => ({
    ...e,
    _aum: parseAUMToNumber(e['规模']),
    _yield: parsePercent(e['股息率']),
    _totalReturn: parsePercent(e['年化总收益%']),
    _priceReturn: parsePercent(e['年化价格变动%']),
    _divReturn: parsePercent(e['年化分红收益%']),
    _fee: parsePercent(e['费率']),
    _cumTotal: parsePercent(e['累计总收益%']),
    _cumPrice: parsePercent(e['累计价格变动%']),
    _cumDiv: parsePercent(e['累计分红收益%']),
  })), []);

  const byCategory = useMemo(() => {
    const map = {};
    categories.forEach(c => { map[c] = etfList.filter(e => e['类别'] === c); });
    return map;
  }, [etfList, categories]);

  const categoryStats = useMemo(() => categories.map(cat => {
    const items = byCategory[cat].filter(e => e._totalReturn != null);
    const count = items.length;
    const totalAUM = byCategory[cat].reduce((s, e) => s + e._aum, 0);
    const avgYield = count ? items.reduce((s, e) => s + (e._yield || 0), 0) / count : 0;
    const avgReturn = count ? items.reduce((s, e) => s + e._totalReturn, 0) / count : 0;
    return { category: cat, count: byCategory[cat].length, dataCount: count, totalAUM, avgYield, avgReturn };
  }), [categories, byCategory]);

  return { market, categories, etfList, byCategory, categoryStats };
}
