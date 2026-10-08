// An explicit seed makes rolls and saved combats reproducible.
export function nextRandom(seed) {
  const nextSeed = (Math.imul(seed >>> 0, 1664525) + 1013904223) >>> 0;
  return { seed: nextSeed, value: nextSeed / 4294967296 };
}
export function pick(entries, seed) {
  const roll = nextRandom(seed);
  return { value: entries[Math.floor(roll.value * entries.length)], seed: roll.seed };
}
