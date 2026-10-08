import { races } from './races.js';
import { classes } from './classes.js';
import { talents } from './talents.js';
import { items } from './items.js';
import { gifts } from './gifts.js';
import { abilities } from './abilities.js';
import { statuses } from './statuses.js';

export const content = Object.freeze({ races, classes, talents, items, gifts, abilities, statuses });
export const byId = Object.fromEntries(Object.entries(content).map(([kind, entries]) => [kind, new Map(entries.map(entry => [entry.id, entry]))]));
export function get(kind, id) { return byId[kind]?.get(id) ?? null; }
export function options(kind, filter = () => true) { return content[kind].filter(filter); }
