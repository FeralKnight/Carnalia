export const GAME_VERSION = '0.1.0';
export const SCHEMA_VERSION = 1;
export const CONTENT_VERSION = 1;
export const RULES = Object.freeze({
  baseStats: { hp: 72, damage: 8, defense: 3, speed: 5, energy: 10, resistance: 2 },
  maxTalents: 2,
  energyPerRound: 2,
  defenseFactor: 0.75,
  guardMultiplier: 0.5,
  maxRounds: 30,
  maxRerolls: 3,
  slots: ['weapon', 'armor', 'accessory', 'relic'],
  statKeys: ['hp', 'damage', 'defense', 'speed', 'energy', 'resistance']
});
