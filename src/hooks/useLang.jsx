import React, { createContext, useContext, useState, useCallback } from 'react';
import i18nData, { SHORT_CAT_I18N } from '../utils/i18n';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState('zh');
  const toggle = useCallback(() => setLang(l => l === 'zh' ? 'en' : 'zh'), []);
  const t = useCallback((key) => i18nData[lang]?.[key] ?? i18nData.zh[key] ?? key, [lang]);
  const sc = useCallback((cat) => SHORT_CAT_I18N[lang]?.[cat] ?? cat, [lang]);
  return <LangContext.Provider value={{ lang, toggle, t, sc }}>{children}</LangContext.Provider>;
}

export function useLang() { return useContext(LangContext); }
