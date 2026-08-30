/**
 * Dev-only server routes for the in-browser Copy Editor
 * (src/dev/CopyEditor.jsx). Active only under `vite` / `vite dev`, never in
 * a production build.
 *
 *   GET  /__copy-editor/source        -> { files: { "<rel>": "<text>" } }
 *   POST /__copy-editor/save          <- { replacements: [{ file, find, replace }] }
 *                                     -> { ok, applied, failed: [{ find, reason }] }
 *
 * Each replacement is an exact string swap that must match exactly once in
 * its file — no parsing, so it can't corrupt syntax as long as the editor
 * hands it a real source snippet.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

// Files the editor is allowed to read and write.
const ALLOWED = ['src/data/realms.js'];

export default function copyEditorPlugin() {
  let root = process.cwd();

  const readBody = (req) =>
    new Promise((resolve, reject) => {
      let raw = '';
      req.on('data', (c) => {
        raw += c;
        if (raw.length > 5_000_000) reject(new Error('body too large'));
      });
      req.on('end', () => resolve(raw));
      req.on('error', reject);
    });

  const json = (res, code, obj) => {
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(obj));
  };

  return {
    name: 'copy-editor',
    apply: 'serve',
    configResolved(cfg) {
      root = cfg.root;
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/__copy-editor/')) return next();

        try {
          if (req.method === 'GET' && req.url === '/__copy-editor/source') {
            const files = {};
            for (const rel of ALLOWED) {
              files[rel] = await fs.readFile(path.join(root, rel), 'utf8');
            }
            return json(res, 200, { files });
          }

          if (req.method === 'POST' && req.url === '/__copy-editor/save') {
            const { replacements = [] } = JSON.parse((await readBody(req)) || '{}');
            const byFile = new Map();
            for (const r of replacements) {
              if (!ALLOWED.includes(r.file)) continue;
              if (!byFile.has(r.file)) byFile.set(r.file, []);
              byFile.get(r.file).push(r);
            }

            const failed = [];
            let applied = 0;

            for (const [rel, edits] of byFile) {
              const abs = path.join(root, rel);
              let text = await fs.readFile(abs, 'utf8');
              let touched = false;
              for (const { find, replace } of edits) {
                if (find === replace) continue;
                const count = text.split(find).length - 1;
                if (count !== 1) {
                  failed.push({ find, reason: count === 0 ? 'not found' : `found ${count}x` });
                  continue;
                }
                text = text.replace(find, replace);
                touched = true;
                applied += 1;
              }
              if (touched) await fs.writeFile(abs, text, 'utf8');
            }

            return json(res, 200, { ok: failed.length === 0, applied, failed });
          }

          return json(res, 404, { error: 'unknown copy-editor route' });
        } catch (err) {
          return json(res, 500, { error: String(err?.message || err) });
        }
      });
    },
  };
}
