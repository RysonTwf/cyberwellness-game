/**
 * Dev-only server routes for the in-browser Copy Editor
 * (src/dev/CopyEditor.jsx). Active only under `vite` / `vite dev`, never in
 * a production build.
 *
 *   GET  /__copy-editor/source     -> { files: { "<rel>": "<text>" } }
 *   POST /__copy-editor/save       <- { replacements: [{ file, find, replace }] }
 *                                  -> { ok, applied, failed: [{ find, reason }] }
 *   POST /__copy-editor/publish    <- { replacements, message?, dryRun? }
 *                                  -> { ok, applied, failed, committed, pushed[],
 *                                       gitError?, error? }
 *
 * A replacement is an exact string swap. It normally has to match exactly
 * once in the file; when it carries `realmId` + `band` it may match a line
 * that Bully Bog (say) repeats across its two bands, and the search is then
 * narrowed to that band's `const <realm><Band> = { … }` object.
 *
 * `publish` writes to the working tree the same way `save` does, then
 * commits *only the editor's own hunk*: it re-applies the same swaps to the
 * committed (HEAD) version of each file and stages that, so any other
 * unsaved edits you have in the same file stay in your working tree and out
 * of the commit. It then pushes to every configured remote — `nato`/`main`
 * is the refspec Vercel builds from.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { parseAst } from 'vite';

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

/**
 * Bully Bog (and any realm that shares wording between its P1–P3 and P4–P6
 * bands) has the same sentence in the file two or more times, so a bare
 * "must match exactly once" swap can't tell which one the editor meant.
 *
 * When an edit carries a `realmId` + `band`, narrow the search to that
 * band's own `const <realm><Band> = { … }` object: find the top-level
 * declarator whose name starts with the realm id and ends with the band,
 * then look for the literal only inside its source range. Returns the
 * `[start, end)` range of the one occurrence, or null if the region can't
 * be pinned down or the literal still isn't unique inside it.
 */
function bandScopedRange(text, find, realmId, band) {
  if (!realmId || (band !== 'lower' && band !== 'higher')) return null;
  let ast;
  try {
    ast = parseAst(text);
  } catch {
    return null;
  }
  const rid = realmId.toLowerCase();
  const decls = [];
  for (const node of ast.body) {
    if (node.type !== 'VariableDeclaration') continue;
    for (const d of node.declarations) {
      if (d.id?.type === 'Identifier') {
        decls.push({ name: d.id.name.toLowerCase(), start: d.start, end: d.end });
      }
    }
  }
  const region = decls.filter((d) => d.name.startsWith(rid) && d.name.endsWith(band));
  if (region.length !== 1) return null;

  const { start, end } = region[0];
  const hits = [];
  for (let i = text.indexOf(find, start); i !== -1 && i < end; i = text.indexOf(find, i + find.length)) {
    hits.push(i);
  }
  return hits.length === 1 ? [hits[0], hits[0] + find.length] : null;
}

/**
 * Apply a file's edits to `text` in memory. Pure — used for both the
 * working tree and the HEAD version, so the commit carries exactly the same
 * change the editor made to the working copy.
 */
function applyEdits(text, edits, rel) {
  const failed = [];
  let applied = 0;
  let out = text;

  for (const { find, replace, realmId, band } of edits) {
    if (find === replace) continue;
    const count = out.split(find).length - 1;

    if (count === 1) {
      out = out.replace(find, replace);
      applied += 1;
      continue;
    }

    // Duplicated line — try to pin it to the band the editor was showing.
    if (count > 1 && rel === 'src/data/realms.js') {
      const range = bandScopedRange(out, find, realmId, band);
      if (range) {
        out = out.slice(0, range[0]) + replace + out.slice(range[1]);
        applied += 1;
        continue;
      }
    }

    failed.push({
      find,
      reason: count === 0 ? 'not found' : `found ${count}x, could not tell which one`,
    });
  }

  return { out, applied, failed };
}

/** Group replacements by file, dropping anything outside the allow-list. */
function groupByFile(replacements) {
  const byFile = new Map();
  for (const r of replacements) {
    if (!ALLOWED.includes(r.file)) continue;
    if (!byFile.has(r.file)) byFile.set(r.file, []);
    byFile.get(r.file).push(r);
  }
  return byFile;
}

/** Apply the replacements to the working tree on disk. */
async function writeWorkingTree(root, byFile) {
  const failed = [];
  let applied = 0;
  const touchedFiles = [];

  for (const [rel, edits] of byFile) {
    const abs = path.join(root, rel);
    const before = await fs.readFile(abs, 'utf8');
    const r = applyEdits(before, edits, rel);
    failed.push(...r.failed);
    applied += r.applied;
    if (r.out !== before) {
      await fs.writeFile(abs, r.out, 'utf8');
      touchedFiles.push(rel);
    }
  }

  return { applied, failed, touchedFiles };
}

export default function copyEditorPlugin() {
  let root = process.cwd();

  const git = (args) => pExecFile('git', args, { cwd: root, windowsHide: true, maxBuffer: 20_000_000 });

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

  /**
   * Commit only the editor's hunk. For each touched file: take the HEAD
   * version, apply the same swaps, stage that exact content, then put the
   * working tree back. Other unsaved edits to the file are left alone.
   * Requires an otherwise-empty staging area so the final `git commit`
   * (no pathspec) captures nothing but these blobs.
   */
  const commitHunk = async (byFile, touchedFiles, message, dryRun) => {
    const { stdout: preStaged } = await git(['diff', '--cached', '--name-only']);
    if (preStaged.trim()) {
      return {
        error: `Your staging area already has changes (${preStaged
          .trim()
          .split('\n')
          .join(', ')}). Run "git reset" and try again.`,
      };
    }

    const committedFiles = [];
    const skipped = [];

    for (const rel of touchedFiles) {
      const abs = path.join(root, rel);
      let headVer;
      try {
        ({ stdout: headVer } = await git(['show', `HEAD:${rel}`]));
      } catch {
        skipped.push(rel);
        continue;
      }
      const r = applyEdits(headVer, byFile.get(rel), rel);
      if (r.out === headVer) {
        skipped.push(rel);
        continue;
      }
      const working = await fs.readFile(abs, 'utf8');
      try {
        await fs.writeFile(abs, r.out, 'utf8');
        await git(['add', '--', rel]);
      } finally {
        await fs.writeFile(abs, working, 'utf8'); // always restore the working tree
      }
      committedFiles.push(rel);
    }

    if (!committedFiles.length) {
      return {
        error: skipped.includes('src/data/realms.js')
          ? 'Saved to your working copy, but it could not be committed on its own — that file has other uncommitted edits around these lines. Commit those first, then publish.'
          : 'Saved to your working copy, but there was nothing new to commit.',
      };
    }

    if (dryRun) {
      const { stdout: staged } = await git(['diff', '--cached', '--stat']);
      await git(['reset', '--quiet']); // unstage; working tree already restored
      return { dryRun: true, committedFiles, skipped, staged: staged.trim() };
    }

    await git(['commit', '-m', message]);
    const { stdout: sha } = await git(['rev-parse', '--short', 'HEAD']);
    return { committed: sha.trim(), committedFiles, skipped };
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
            const { applied, failed } = await writeWorkingTree(root, groupByFile(replacements));
            return json(res, 200, { ok: failed.length === 0, applied, failed });
          }

          if (req.method === 'POST' && req.url === '/__copy-editor/publish') {
            const { replacements = [], message, dryRun } = JSON.parse((await readBody(req)) || '{}');
            const byFile = groupByFile(replacements);
            const { applied, failed, touchedFiles } = await writeWorkingTree(root, byFile);

            const result = {
              ok: false,
              applied,
              failed,
              committed: null,
              pushed: [],
              gitError: null,
            };

            if (!touchedFiles.length) {
              result.error = 'No edits could be written to source, so there is nothing to publish.';
              return json(res, 200, result);
            }

            const msg =
              typeof message === 'string' && message.trim()
                ? message.trim()
                : `Copy edit: ${applied} change${applied === 1 ? '' : 's'} from the in-app editor`;

            try {
              const c = await commitHunk(byFile, touchedFiles, msg, dryRun);
              if (c.error) {
                result.error = c.error;
                return json(res, 200, result);
              }
              result.committedFiles = c.committedFiles;
              if (c.skipped?.length) result.skipped = c.skipped;

              if (c.dryRun) {
                result.dryRun = true;
                result.staged = c.staged;
                result.ok = true;
                return json(res, 200, result);
              }
              result.committed = c.committed;

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
                  result.gitError = `push to ${remote} failed: ${e.stderr?.trim() || e.message}`;
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
