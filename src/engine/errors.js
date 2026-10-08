export class GameError extends Error {
  constructor(message, code = 'INVALID_ACTION') {
    super(message);
    this.name = 'GameError';
    this.code = code;
  }
}
export function requireGame(condition, message, code) {
  if (!condition) throw new GameError(message, code);
}
