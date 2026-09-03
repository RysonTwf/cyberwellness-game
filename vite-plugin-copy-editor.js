/**
 * Dev-only server routes for the in-browser Copy Editor
 * (src/dev/CopyEditor.jsx). Active only under `vite` / `vite dev`, never in
 * a production build.
 *
 *   GET  /__copy-editor/source     -> { files: { "<rel>": "<text>" } }
 *   POST /__copy-editor/save       <- { replacements: [{ file, find, replace }] }
 *                                  -> { ok, applied, failed: [{ find, reason }] }
 *   POST /__copy-editor/publish    <- { replacements, message? }
 *                                  -> { ok, applied, failed, committed, pushed[],
 *                                       gitError?, error? }
 *
 * Each replacement is an exact string swap that must match exactly once in
 * its file — no parsing, so it can't corrupt syntax as long as the editor
 * hands it a real source snippet.
 *
 * `publish` writes the same way, then stages *only* the files it touched,
 * commits them, and pushes to every configured remote (`nato`/`main` is the
 * one Vercel builds from). It never touches unrelated working-tree changes —
 * the commit contains exactly the copy-editor files and nothing else.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const pExecFile = promisify(execFile);

// Files the editor is allowed to read and write.
const ALLOWED = [
  'src/data/realms.js',
  'src/components/IntroStory.jsx',
  'src/components/TravelerRoom.jsx',
  'src/components/AtlasMap.jsx',
  'src/components/RealmIntro.jsx',
  'src/components/AtlasGate.jsx',
  'src/components/CertificateScreen.jsx',
];

// Where each remote's copy-editor commits should land. `HEAD` keeps the
// remote's like-named branch in step; `HEAD:main` is the refspec Vercel
// watches on `nato`. Remotes not present in this clone are skipped.
const PUSH_TARGETS = [
  { remote: 'origin', refspec: 'HEAD' },
  { remote: 'nato', refspec: 'HEAD:main' },
];

/** Apply the exact-string replacements to disk. Returns what changed. */
async function applyReplacements(root, replacements) {
  const byFile = new Map();
  for (const r of replacements) {
    if (!ALLOWED.includes(r.file)) continue;
    if (!byFile.has(r.file)) byFile.set(r.file, []);
    byFile.get(r.file).push(r);
  }

  const failed = [];
  let applied = 0;
  const touchedFiles = [];

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
    if (touched) {
      await fs.writeFile(abs, text, 'utf8');
      touchedFiles.push(rel);
    }
  }

  return { applied, failed, touchedFiles };
}

export default function copyEditorPlugin() {
  let root = process.cwd();

  const git = (args) => pExecFile('git', args, { cwd: root, windowsHide: true });

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
            const { applied, failed } = await applyReplacements(root, replacements);
            return json(res, 200, { ok: failed.length === 0, applied, failed });
          }

          if (req.method === 'POST' && req.url === '/__copy-editor/publish') {
            const { replacements = [], message } = JSON.parse((await readBody(req)) || '{}');
            const { applied, failed, touchedFiles } = await applyReplacements(root, replacements);

            const result = {
              ok: false,
              applied,
              failed,
              committed: null,
              pushed: [],
              gitError: null,
            };

            if (!touchedFiles.length) {
              result.error =
                'No edits could be written to source, so there is nothing to publish.';
              return json(res, 200, result);
            }

            try {
              // Stage ONLY the files this call wrote — never sweep up
              // whatever else is dirty in the tree.
              await git(['add', '--', ...touchedFiles]);
              const { stdout: staged } = await git([
                'diff',
                '--cached',
                '--name-only',
                '--',
                ...touchedFiles,
              ]);
              if (!staged.trim()) {
                result.error =
                  'Those edits were already saved in source — nothing new to commit.';
                return json(res, 200, result);
              }

              const msg =
                typeof message === 'string' && message.trim()
                  ? message.trim()
                  : `Copy edit: ${applied} change${applied === 1 ? '' : 's'} from the in-app editor`;
              await git(['commit', '-m', msg, '--', ...touchedFiles]);
              const { stdout: sha } = await git(['rev-parse', '--short', 'HEAD']);
              result.committed = sha.trim();

              const { stdout: remoteList } = await git(['remote']);
              const remotes = new Set(
                remoteList
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean),
              );
              for (const { remote, refspec } of PUSH_TARGETS) {
                if (!remotes.has(remote)) continue;
                try {
                  await git(['push', remote, refspec]);
                  result.pushed.push(remote);
                } catch (e) {
                  result.gitError = `push to ${remote} failed: ${
                    e.stderr?.trim() || e.message
                  }`;
                }
              }

              result.ok = result.pushed.length > 0 && failed.length === 0 && !result.gitError;
            } catch (e) {
              result.gitError = e.stderr?.trim() || e.message;
            }

            return json(res, 200, result);
          }

          return json(res, 404, { error: 'unknown copy-editor route' });
        } catch (err) {
          return json(res, 500, { error: String(err?.message || err) });
        }
      });
    },
  };
}
