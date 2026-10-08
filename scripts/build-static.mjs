import { mkdir, readFile, writeFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
if (!/<!doctype html>/i.test(html) || !/<html\s+lang="ja"/i.test(html) || !/<\/html>/i.test(html)) {
  throw new Error('Invalid public HTML entrypoint');
}
if (html.length < 500) throw new Error('Unexpectedly empty demo');
await mkdir(new URL('../site/', import.meta.url), { recursive: true });
await writeFile(new URL('../site/index.html', import.meta.url), html);
await writeFile(
  new URL('../site/release.json', import.meta.url),
  JSON.stringify({
    commit: process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || 'local'
  }, null, 2) + '\n'
);
console.log('CareShift static assets validated and prepared');
