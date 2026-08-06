import React from 'react';
import { createRoot } from 'react-dom/client';

// Fonts per design.md §3: display / body / stamp. Self-hosted so there is no
// external request and the stamp label never falls back mid-render.
import '@fontsource/baloo-2/500.css';
import '@fontsource/baloo-2/700.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/700.css';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';

import './styles.css';
import App from './App';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
