import { validateContent } from '../src/engine/content-validation.js';
const errors=validateContent();
if(errors.length)throw new Error(errors.join('\n'));
console.log('Contenido validado');
