import { Analytics } from '@vercel/analytics/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { initSentry } from './lib/sentry';

// Production ortamında Sentry'yi initialize et
initSentry();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>,
);