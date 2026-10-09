import { CONTENT_VERSION } from '../engine/config.js';
import { initializeTactics } from '../engine/tactical.js';
import { RoomService } from './rooms.js';
import { requireGame } from '../engine/errors.js';
const encode = room => JSON.stringify({ ...room, requests: room.requests.map(m => [...m]) });
const decode = text => {
  const room = JSON.parse(text);
  if(room.state.contentVersion===2){room.state.contentVersion=CONTENT_VERSION;if(room.state.combat)initializeTactics(room.state.players,room.state.combat);}
  room.requests = room.requests.map(entries => new Map(entries));
  return room;
};
export class PersistentRooms {
  constructor(store) { this.store = store; }
  async execute(operation, code, token, body) {
    const service = new RoomService();
    if (operation === 'create') {
      const result = service.create(body.name, body.mode);
      await this.store.write(result.code, encode(service.rooms.get(result.code)), null);
      return result;
    }
    code = String(code ?? body?.code ?? '').toUpperCase();
    requireGame(/^[A-F0-9]{6}$/.test(code), 'Código de sala inválido.');
    const saved = await this.store.read(code);
    requireGame(saved, 'Sala no encontrada.');
    const room = decode(saved.text);
    requireGame(Date.now() - room.touched < 6 * 3600 * 1000, 'La sala expiró. Crea una nueva.');
    service.rooms.set(code, room);
    if (operation === 'state') {
      const { index } = service.authenticate(code, token);
      return service.view(room, index);
    }
    let result;
    if (operation === 'join') result = service.join(code, body.name);
    else if (operation === 'command') result = service.command(code, token, body);
    else requireGame(false, 'Ruta desconocida.');
    await this.store.write(code, encode(room), saved.etag);
    return result;
  }
}
