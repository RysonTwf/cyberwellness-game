import React from 'react';
import { createRoot } from 'react-dom/client';

// Fonts per design.md §3: display / body / stamp. Self-hosted so there is no
// external request and the stamp label never falls back mid-render.
//
// Latin subsets only. The bare `@fontsource/<font>/<weight>.css` entrypoints
// pull in every subset the family ships — devanagari, vietnamese and cyrillic
// alongside latin — which was 76% of a 1MB font payload for a game with no
// text in any of those scripts. `unicode-range` meant a browser never
// *downloaded* them, but they were all still deployed. Add a subset back here
// if the game is ever localised into a script that needs it.
import '@fontsource/baloo-2/latin-500.css';
import '@fontsource/baloo-2/latin-700.css';
import '@fontsource/nunito/latin-400.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/space-mono/latin-400.css';
import '@fontsource/space-mono/latin-700.css';

import './styles.css';
import App from './App';
import ArtPreview from './dev/ArtPreview';

// `#art` opens the scene contact sheet instead of the game — a dev aid for
// checking scenery against the walkable band. Nothing links to it.
const Root = window.location.hash === '#art' ? ArtPreview : App;


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
