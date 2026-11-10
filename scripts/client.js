import { hydrate } from 'svelte';

const pages = import.meta.glob('/src/routes/kb/**/+page.svx');
const route = window.location.pathname.replace(/\/$/, '');
const path = `/src/routes${route}/+page.svx`;
if (pages[path]) {
  const mod = await pages[path]();
  hydrate(mod.default, { target: document.body });
}
