import { cp, mkdir, rm } from 'node:fs/promises';
const output = new URL('../dist/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(new URL('../index.html', import.meta.url), new URL('../dist/index.html', import.meta.url));
for(const dir of ['ui','engine','content','assets']) await cp(new URL(`../src/${dir}/`, import.meta.url), new URL(`../dist/src/${dir}/`, import.meta.url), { recursive: true });
console.log('Carnalia lista en dist/');
