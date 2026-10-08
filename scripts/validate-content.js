import { validateContent } from '../src/engine/content-validation.js';
import { assetManifest } from '../src/assets/manifest.js';
import { items } from '../src/content/items.js';
const errors = validateContent();
for (const item of items) if (!assetManifest[item.sprite]) errors.push(`items/${item.id}: sprite ausente: ${item.sprite}`);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('Catálogos, referencias y sprites válidos.');
