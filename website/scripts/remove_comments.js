#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

const args = process.argv.slice(2);
const options = {
  dir: args.find(a => !a.startsWith('--')) || process.cwd(),
  dryRun: args.includes('--dry-run'),
  extsArg: (args.find(a => a.startsWith('--exts=')) || '').replace('--exts=', ''),
};

const DEFAULT_EXTS = [
  '.js', '.ts', '.jsx', '.tsx', '.css', '.scss', '.html', '.htm', '.json', '.md'
];

const exts = options.extsArg ? options.extsArg.split(',').map(s => s.trim()) : DEFAULT_EXTS;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'backups_remove_comments') continue;
      files.push(...await walk(full));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

function removeCommentsByExt(ext, content) {
  let out = content;
  // Remove block comments for all languages
  out = out.replace(/\/\*[\s\S]*?\*\//g, '');

  if (ext === '.css' || ext === '.scss') {
    return out;
  }

  if (ext === '.html' || ext === '.htm' || ext === '.md') {
    // remove HTML comments
    out = out.replace(/<!--([\s\S]*?)-->/g, '');
    return out;
  }

  // For JS/TS/JSON-like: remove // comments when they are standalone or follow whitespace
  if (ext === '.js' || ext === '.ts' || ext === '.jsx' || ext === '.tsx' || ext === '.json') {
    // Remove single-line comments that start the line or are preceded by whitespace
    out = out.replace(/(^|\s)\/\/.*$/gm, '$1');
    return out;
  }

  return out;
}

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {}
}

async function main() {
  const root = path.resolve(options.dir);
  console.log(`Scanning: ${root}` + (options.dryRun ? ' (dry-run)' : ''));
  const allFiles = await walk(root);
  const targetFiles = allFiles.filter(f => exts.includes(path.extname(f).toLowerCase()));

  const backupRoot = path.join(root, 'backups_remove_comments');
  let changed = 0;
  for (const file of targetFiles) {
    try {
      const content = await fs.readFile(file, 'utf8');
      const ext = path.extname(file).toLowerCase();
      const processed = removeCommentsByExt(ext, content);
      if (processed !== content) {
        changed++;
        if (options.dryRun) {
          console.log(`[DRY] Would modify: ${file}`);
        } else {
          const rel = path.relative(root, file);
          const backupPath = path.join(backupRoot, rel + '.orig');
          const backupDir = path.dirname(backupPath);
          await ensureDir(backupDir);
          await fs.copyFile(file, backupPath);
          await fs.writeFile(file, processed, 'utf8');
          console.log(`Modified: ${file}  (backup: ${backupPath})`);
        }
      }
    } catch (err) {
      console.error(`Failed processing ${file}:`, err.message);
    }
  }

  console.log(`Done. Files scanned: ${targetFiles.length}. Modified: ${changed}.`);
  if (!options.dryRun && changed > 0) {
    console.log(`Backups saved under: ${backupRoot}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
