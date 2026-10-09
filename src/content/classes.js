import { abilities } from './abilities.js';
export const classes = [
  {
    "id": "vanguard",
    "name": "Vanguardia",
    "description": "Especialidad provisional: heavy_strike / fortify",
    "stats": {
      "hp": 8,
      "defense": 2,
      "speed": -1
    },
    "abilities": [
      "heavy_strike",
      "fortify"
    ],
    "ultimate": "ultimate_blade"
  },
  {
    "id": "arcanist",
    "name": "Arcanista",
    "description": "Especialidad provisional: ember_bolt / mend",
    "stats": {
      "energy": 4,
      "speed": 1,
      "hp": -5
    },
    "abilities": [
      "ember_bolt",
      "mend"
    ],
    "ultimate": "ultimate_arcane"
  },
  {
    "id": "class_2",
    "name": "Duelista",
    "description": "Especialidad provisional: pierce / haste",
    "stats": {
      "speed": 3,
      "damage": 1
    },
    "abilities": [
      "pierce",
      "haste"
    ],
    "ultimate": "ultimate_blade"
  },
  {
    "id": "class_3",
    "name": "Asesino",
    "description": "Especialidad provisional: venom / pierce",
    "stats": {
      "speed": 2,
      "hp": -4,
      "damage": 2
    },
    "abilities": [
      "venom",
      "pierce"
    ],
    "ultimate": "ultimate_arcane"
  },
  {
    "id": "class_4",
    "name": "Berserker",
    "description": "Especialidad provisional: rage / heavy_strike",
    "stats": {
      "damage": 4,
      "defense": -2
    },
    "abilities": [
      "rage",
      "heavy_strike"
    ],
    "ultimate": "ultimate_blade"
  },
  {
    "id": "class_5",
    "name": "Paladín",
    "description": "Especialidad provisional: mend / fortify",
    "stats": {
      "defense": 3,
      "energy": 1
    },
    "abilities": [
      "mend",
      "fortify"
    ],
    "ultimate": "ultimate_arcane"
  },
  {
    "id": "class_6",
    "name": "Nigromante",
    "description": "Especialidad provisional: drain / venom",
    "stats": {
      "energy": 4,
      "hp": -3
    },
    "abilities": [
      "drain",
      "venom"
    ],
    "ultimate": "ultimate_blade"
  },
  {
    "id": "class_7",
    "name": "Druida",
    "description": "Especialidad provisional: regrowth / cleanse",
    "stats": {
      "hp": 4,
      "resistance": 2
    },
    "abilities": [
      "regrowth",
      "cleanse"
    ],
    "ultimate": "ultimate_arcane"
  },
  {
    "id": "class_8",
    "name": "Monje",
    "description": "Especialidad provisional: focus_energy / pierce",
    "stats": {
      "speed": 2,
      "resistance": 1
    },
    "abilities": [
      "focus_energy",
      "pierce"
    ],
    "ultimate": "ultimate_blade"
  },
  {
    "id": "class_9",
    "name": "Cazador",
    "description": "Especialidad provisional: bleeding_cut / echo_bind",
    "stats": {
      "damage": 2,
      "speed": 1
    },
    "abilities": [
      "bleeding_cut",
      "echo_bind"
    ],
    "ultimate": "ultimate_arcane"
  },
  {
    "id": "class_10",
    "name": "Alquimista",
    "description": "Especialidad provisional: heavy_strike / fortify",
    "stats": {
      "hp": 6,
      "defense": 2,
      "speed": -1,
      "energy": 1
    },
    "abilities": [
      "heavy_strike",
      "fortify"
    ],
    "ultimate": "ultimate_blade"
  },
  {
    "id": "class_11",
    "name": "Hechicero",
    "description": "Especialidad provisional: ember_bolt / mend",
    "stats": {
      "energy": 5,
      "speed": 1,
      "hp": -7
    },
    "abilities": [
      "ember_bolt",
      "mend"
    ],
    "ultimate": "ultimate_arcane"
  },
  {
    "id": "class_12",
    "name": "Guardián",
    "description": "Especialidad provisional: pierce / haste",
    "stats": {
      "speed": 3,
      "damage": 1,
      "energy": 1,
      "hp": -2
    },
    "abilities": [
      "pierce",
      "haste"
    ],
    "ultimate": "ultimate_blade"
  },
  {
    "id": "class_13",
    "name": "Bardo",
    "description": "Especialidad provisional: venom / pierce",
    "stats": {
      "speed": 2,
      "hp": -6,
      "damage": 2,
      "energy": 1
    },
    "abilities": [
      "venom",
      "pierce"
    ],
    "ultimate": "ultimate_arcane"
  },
  {
    "id": "class_14",
    "name": "Espadachín",
    "description": "Especialidad provisional: rage / heavy_strike",
    "stats": {
      "damage": 4,
      "defense": -2,
      "energy": 1,
      "hp": -2
    },
    "abilities": [
      "rage",
      "heavy_strike"
    ],
    "ultimate": "ultimate_blade"
  },
  {
    "id": "class_15",
    "name": "Inquisidor",
    "description": "Especialidad provisional: mend / fortify",
    "stats": {
      "defense": 3,
      "energy": 2,
      "hp": -2
    },
    "abilities": [
      "mend",
      "fortify"
    ],
    "ultimate": "ultimate_arcane"
  },
  {
    "id": "class_16",
    "name": "Brujo",
    "description": "Especialidad provisional: drain / venom",
    "stats": {
      "energy": 5,
      "hp": -5
    },
    "abilities": [
      "drain",
      "venom"
    ],
    "ultimate": "ultimate_blade"
  },
  {
    "id": "class_17",
    "name": "Chamán",
    "description": "Especialidad provisional: regrowth / cleanse",
    "stats": {
      "hp": 2,
      "resistance": 2,
      "energy": 1
    },
    "abilities": [
      "regrowth",
      "cleanse"
    ],
    "ultimate": "ultimate_arcane"
  },
  {
    "id": "class_18",
    "name": "Caballero",
    "description": "Especialidad provisional: focus_energy / pierce",
    "stats": {
      "speed": 2,
      "resistance": 1,
      "energy": 1,
      "hp": -2
    },
    "abilities": [
      "focus_energy",
      "pierce"
    ],
    "ultimate": "ultimate_blade"
  },
  {
    "id": "class_19",
    "name": "Elementalista",
    "description": "Especialidad provisional: bleeding_cut / echo_bind",
    "stats": {
      "damage": 2,
      "speed": 1,
      "energy": 1,
      "hp": -2
    },
    "abilities": [
      "bleeding_cut",
      "echo_bind"
    ],
    "ultimate": "ultimate_arcane"
  },
  {
    "id": "class_20",
    "name": "Lancero",
    "description": "Especialidad provisional: heavy_strike / fortify",
    "stats": {
      "hp": 6,
      "defense": 2,
      "speed": -1,
      "energy": 1
    },
    "abilities": [
      "heavy_strike",
      "fortify"
    ],
    "ultimate": "ultimate_blade"
  },
  {
    "id": "class_21",
    "name": "Corsario",
    "description": "Especialidad provisional: ember_bolt / mend",
    "stats": {
      "energy": 5,
      "speed": 1,
      "hp": -7
    },
    "abilities": [
      "ember_bolt",
      "mend"
    ],
    "ultimate": "ultimate_arcane"
  },
  {
    "id": "class_22",
    "name": "Artificiero",
    "description": "Especialidad provisional: pierce / haste",
    "stats": {
      "speed": 3,
      "damage": 1,
      "energy": 1,
      "hp": -2
    },
    "abilities": [
      "pierce",
      "haste"
    ],
    "ultimate": "ultimate_blade"
  },
  {
    "id": "class_23",
    "name": "Templario",
    "description": "Especialidad provisional: venom / pierce",
    "stats": {
      "speed": 2,
      "hp": -6,
      "damage": 2,
      "energy": 1
    },
    "abilities": [
      "venom",
      "pierce"
    ],
    "ultimate": "ultimate_arcane"
  },
  {
    "id": "class_24",
    "name": "Oráculo",
    "description": "Especialidad provisional: rage / heavy_strike",
    "stats": {
      "damage": 4,
      "defense": -2,
      "energy": 1,
      "hp": -2
    },
    "abilities": [
      "rage",
      "heavy_strike"
    ],
    "ultimate": "ultimate_blade"
  },
  {
    "id": "class_25",
    "name": "Segador",
    "description": "Especialidad provisional: mend / fortify",
    "stats": {
      "defense": 3,
      "energy": 2,
      "hp": -2
    },
    "abilities": [
      "mend",
      "fortify"
    ],
    "ultimate": "ultimate_arcane"
  },
  {
    "id": "class_26",
    "name": "Centinela",
    "description": "Especialidad provisional: drain / venom",
    "stats": {
      "energy": 5,
      "hp": -5
    },
    "abilities": [
      "drain",
      "venom"
    ],
    "ultimate": "ultimate_blade"
  },
  {
    "id": "class_27",
    "name": "Pugilista",
    "description": "Especialidad provisional: regrowth / cleanse",
    "stats": {
      "hp": 2,
      "resistance": 2,
      "energy": 1
    },
    "abilities": [
      "regrowth",
      "cleanse"
    ],
    "ultimate": "ultimate_arcane"
  },
  {
    "id": "class_28",
    "name": "Ilusionista",
    "description": "Especialidad provisional: focus_energy / pierce",
    "stats": {
      "speed": 2,
      "resistance": 1,
      "energy": 1,
      "hp": -2
    },
    "abilities": [
      "focus_energy",
      "pierce"
    ],
    "ultimate": "ultimate_blade"
  },
  {
    "id": "class_29",
    "name": "Cronista",
    "description": "Especialidad provisional: bleeding_cut / echo_bind",
    "stats": {
      "damage": 2,
      "speed": 1,
      "energy": 1,
      "hp": -2
    },
    "abilities": [
      "bleeding_cut",
      "echo_bind"
    ],
    "ultimate": "ultimate_arcane"
  }
];

for(const c of classes) c.description = 'Técnicas: ' + c.abilities.map(id=>abilities.find(a=>a.id===id).name).join(' · ');
