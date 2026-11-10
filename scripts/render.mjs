import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, createServer } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { analysis } from './analyze.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const escape = (text) => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const configuration = () => ({
  root,
  configFile: false,
  plugins: [svelte({
    extensions: ['.svelte', '.svx'],
    preprocess: mdsvex({
      extensions: ['.svx'],
      layout: { runbook: resolve(root, 'src/lib/layouts/runbook.svelte') },
    }),
    compilerOptions: { css: 'injected' },
  })],
  resolve: { alias: { '#lib': resolve(root, 'src/lib') } },
});
const server = await createServer({
  ...configuration(),
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
});

try {
  const { pages, render } = await server.ssrLoadModule('/scripts/render-entry.js');
  for (const [path, mod] of Object.entries(pages)) {
    const route = path.replace('/src/routes', '').replace('/+page.svx', '');
    const { head, body } = render(mod.default);
    const html = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'
      + '<link rel="icon" href="data:,">'
      + '<meta name="viewport" content="width=device-width, initial-scale=1">'
      + head + '<script type="module" src="/assets/kb-client.js"></script>'
      + '</head><body>' + body + '</body></html>\n';
    const dir = resolve(root, 'docs', route.slice(1));
    await mkdir(dir, { recursive: true });
    await writeFile(resolve(dir, 'index.html'), html);
    if (mod.metadata.signature && (!body.includes('desk ref') || body.includes('no desk ref'))) {
      throw new Error(`Signed page did not render its stamp: ${route}`);
    }
    console.log(`Rendered ${route}: ${escape(mod.metadata.title)}`);
  }
  await writeFile(resolve(root, 'docs/index.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8">'
    + '<title>Support KB</title></head><body><h1>Support knowledge base</h1>'
    + '<p><a href="/kb/incidents/4471-follow-up/">Read the #4471 follow-up</a></p>'
    + '<p><a href="/kb/">Browse all pages</a></p>'
    + '<p>Rendered export snapshot. The KB pages include working interactive examples; their report data is not a live feed.</p>'
    + '</body></html>\n');
  await mkdir(resolve(root, 'evidence'), { recursive: true });
  await writeFile(resolve(root, 'evidence/analysis.json'), JSON.stringify(analysis(), null, 2) + '\n');
  console.log('Static HTML uses the actual MDsveX/Svelte components and data, not a hand-written substitute.');
} finally {
  await server.close();
}

await build({
  ...configuration(),
  base: '/assets/',
  build: {
    outDir: resolve(root, 'docs/assets'),
    emptyOutDir: true,
    target: 'es2022',
    rollupOptions: {
      input: resolve(root, 'scripts/client.js'),
      output: { entryFileNames: 'kb-client.js', chunkFileNames: '[name]-[hash].js', assetFileNames: '[name]-[hash][extname]' },
    },
  },
});
console.log('Browser assets built; the rendered pages hydrate their interactive examples.');
