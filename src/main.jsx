import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { LangProvider } from './hooks/useLang';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter><LangProvider><App /></LangProvider></HashRouter>
);
