import { get } from '../content/registry.js';
import { assetManifest } from '../assets/manifest.js';

const skinColors = { warm: ['#e5af83', '#ae715f'], light: ['#f2d2b0', '#c49a82'], deep: ['#9d665b', '#634752'] };
const hairColors = { dark: ['#2d2538', '#5f4252'], silver: ['#d9d9df', '#8b93ad'], flame: ['#ee8151', '#994154'] };

export function composeSprite(canvas, build, facing = 'right') {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = 48; canvas.height = 64;
  ctx.clearRect(0, 0, 48, 64);
  ctx.save();
  if (facing === 'left') { ctx.translate(48, 0); ctx.scale(-1, 1); }
  const box = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  const [skin, skinShade] = skinColors[build.appearance.skin];
  const [hair, hairShade] = hairColors[build.appearance.hair];
  const armorId = get('items', build.equipment.armor)?.sprite;
  const armor = assetManifest[armorId];
  const accessory = assetManifest[get('items', build.equipment.accessory)?.sprite];
  const relic = assetManifest[get('items', build.equipment.relic)?.sprite];
  const weapon = assetManifest[get('items', build.equipment.weapon)?.sprite];
  const ember = build.raceId === 'emberkin';
  const trim = build.classId === 'arcanist' ? '#8f79bb' : '#d9af79';

  // Back layers: cape, shadow and the two legs.
  if (build.appearance.cape !== 'none') {
    const cape = build.appearance.cape === 'red' ? '#903e4d' : '#4a6293';
    box(13, 27, 25, 24, '#302537'); box(12, 30, 4, 19, cape); box(33, 31, 7, 22, cape);
    box(16, 46, 22, 7, cape); box(33, 51, 5, 3, '#d4aa74');
  }
  box(16, 43, 8, 13, '#373348'); box(26, 43, 8, 13, '#373348');
  box(16, 54, 9, 4, '#342534'); box(26, 54, 10, 4, '#342534');
  box(17, 55, 6, 2, '#786055'); box(27, 55, 7, 2, '#786055');

  // Body, arms and face.
  box(15, 26, 19, 18, '#252631'); box(17, 27, 15, 14, '#555166');
  box(11, 29, 5, 13, skinShade); box(12, 30, 4, 10, skin);
  box(34, 29, 5, 14, skinShade); box(34, 30, 4, 11, skin);
  box(19, 23, 11, 6, skinShade);
  box(17, 14, 16, 13, skinShade); box(18, 14, 13, 11, skin);
  box(17, 18, 2, 5, skinShade); box(31, 18, 2, 5, skinShade);
  if (ember) { box(16, 13, 3, 6, '#c66a52'); box(31, 13, 3, 6, '#c66a52'); }
  box(20, 20, 2, 2, ember ? '#f5bd6a' : '#ecede1'); box(28, 20, 2, 2, ember ? '#f5bd6a' : '#ecede1');
  box(22, 24, 5, 1, skinShade);
  if (build.appearance.style === 'long') { box(16, 15, 3, 21, hairShade); box(31, 14, 4, 23, hairShade); }
  box(16, 12, 18, 6, hairShade); box(18, 11, 13, 5, hair);
  box(16, 16, 5, 3, hair); box(25, 15, 9, 3, hair);
  box(18, 11, 4, 2, hairShade); box(30, 13, 4, 4, hairShade);

  // Gear layers. Every equipped sprite ID is looked up through the manifest.
  if (armor) {
    box(15, 28, 19, 14, armor.shadow); box(18, 28, 13, 12, armor.main);
    box(15, 28, 6, 5, armor.light); box(29, 28, 6, 5, armor.light);
    box(21, 29, 2, 11, armor.light); box(16, 40, 17, 3, armor.shadow);
    box(14, 30, 3, 6, armor.main); box(34, 30, 3, 6, armor.main);
  }
  box(23, 28, 4, 4, trim); box(24, 29, 2, 2, '#3f3248');
  box(17, 40, 15, 2, '#342935'); box(23, 40, 4, 2, trim);
  if (accessory?.shape === 'ring') box(36, 39, 3, 2, accessory.main);
  if (accessory?.shape === 'charm') { box(24, 33, 2, 3, accessory.main); box(23, 32, 4, 1, '#e4c99a'); }
  if (relic?.shape === 'orbit') {
    box(6, 18, 5, 5, '#3e3044'); box(7, 19, 3, 3, relic.main);
    box(5, 16, 2, 2, relic.main); box(11, 22, 2, 2, relic.main);
  }
  if (build.giftId === 'cinder_gift') { box(7, 35, 2, 4, '#d2594f'); box(8, 32, 2, 3, '#ffc070'); }
  else { box(8, 34, 2, 4, '#9da9e8'); box(6, 38, 2, 2, '#6b79c8'); }

  if (weapon) {
    box(36, 39, 4, 5, skin);
    if (weapon.shape === 'staff') {
      box(40, 17, 3, 40, weapon.grip); box(39, 13, 5, 7, weapon.shade);
      box(40, 12, 3, 6, weapon.metal); box(41, 10, 2, 3, '#ffdc95');
    } else if (weapon.shape === 'axe') {
      box(41, 16, 3, 40, weapon.grip); box(37, 18, 8, 12, weapon.shade);
      box(35, 19, 7, 10, weapon.metal); box(34, 21, 2, 6, weapon.shade);
    } else {
      box(41, 14, 3, 26, weapon.shade); box(42, 10, 2, 29, weapon.metal);
      box(41, 7, 2, 7, weapon.metal); box(38, 39, 8, 2, weapon.grip);
      box(42, 41, 2, 13, weapon.grip); box(41, 54, 4, 2, weapon.shade);
    }
  }
  ctx.restore();
}
