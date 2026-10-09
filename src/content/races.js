export const races = [
  {
    "id": "human",
    "name": "Errante",
    "description": "Linaje provisional. +4 hp, +2 energy",
    "stats": {
      "hp": 4,
      "energy": 2
    },
    "visual": "human"
  },
  {
    "id": "emberkin",
    "name": "Cenizo",
    "description": "Linaje provisional. +2 damage, +2 resistance, -4 hp",
    "stats": {
      "damage": 2,
      "resistance": 2,
      "hp": -4
    },
    "visual": "human"
  },
  {
    "id": "race_2",
    "name": "Elfo solar",
    "description": "Linaje provisional. +2 speed, +2 energy",
    "stats": {
      "speed": 2,
      "energy": 2
    },
    "visual": "human"
  },
  {
    "id": "race_3",
    "name": "Elfo lunar",
    "description": "Linaje provisional. +4 energy, -3 hp",
    "stats": {
      "energy": 4,
      "hp": -3
    },
    "visual": "human"
  },
  {
    "id": "race_4",
    "name": "Enano",
    "description": "Linaje provisional. +3 defense, -1 speed",
    "stats": {
      "defense": 3,
      "speed": -1
    },
    "visual": "human"
  },
  {
    "id": "race_5",
    "name": "Orco",
    "description": "Linaje provisional. +3 damage, -2 energy",
    "stats": {
      "damage": 3,
      "energy": -2
    },
    "visual": "human"
  },
  {
    "id": "race_6",
    "name": "Dracónido",
    "description": "Linaje provisional. +6 hp, +1 resistance",
    "stats": {
      "hp": 6,
      "resistance": 1
    },
    "visual": "human"
  },
  {
    "id": "race_7",
    "name": "Tiefling",
    "description": "Linaje provisional. +1 damage, +3 energy",
    "stats": {
      "damage": 1,
      "energy": 3
    },
    "visual": "human"
  },
  {
    "id": "race_8",
    "name": "Serafín",
    "description": "Linaje provisional. +3 resistance, -2 hp",
    "stats": {
      "resistance": 3,
      "hp": -2
    },
    "visual": "human"
  },
  {
    "id": "race_9",
    "name": "Vampiro",
    "description": "Linaje provisional. +2 speed, -4 hp",
    "stats": {
      "speed": 2,
      "hp": -4
    },
    "visual": "human"
  },
  {
    "id": "race_10",
    "name": "Licántropo",
    "description": "Linaje provisional. +2 damage, +1 speed",
    "stats": {
      "damage": 2,
      "speed": 1
    },
    "visual": "human"
  },
  {
    "id": "race_11",
    "name": "Goblin",
    "description": "Linaje provisional. +3 speed, -1 defense",
    "stats": {
      "speed": 3,
      "defense": -1
    },
    "visual": "human"
  },
  {
    "id": "race_12",
    "name": "Gigante",
    "description": "Linaje provisional. +14 hp, -2 speed",
    "stats": {
      "hp": 14,
      "speed": -2
    },
    "visual": "human"
  },
  {
    "id": "race_13",
    "name": "Autómata",
    "description": "Linaje provisional. +3 defense, -1 energy",
    "stats": {
      "defense": 3,
      "energy": -1
    },
    "visual": "human"
  },
  {
    "id": "race_14",
    "name": "Espectro",
    "description": "Linaje provisional. +4 resistance, -8 hp",
    "stats": {
      "resistance": 4,
      "hp": -8
    },
    "visual": "human"
  },
  {
    "id": "race_15",
    "name": "Sirénido",
    "description": "Linaje provisional. +3 energy, +1 defense",
    "stats": {
      "energy": 3,
      "defense": 1
    },
    "visual": "human"
  },
  {
    "id": "race_16",
    "name": "Fae",
    "description": "Linaje provisional. +2 speed, -3 hp, +2 energy",
    "stats": {
      "speed": 2,
      "hp": -3,
      "energy": 2
    },
    "visual": "human"
  },
  {
    "id": "race_17",
    "name": "Quimera",
    "description": "Linaje provisional. +5 hp, +1 damage",
    "stats": {
      "hp": 5,
      "damage": 1
    },
    "visual": "human"
  },
  {
    "id": "race_18",
    "name": "Drow",
    "description": "Linaje provisional. +1 speed, +1 damage, +1 resistance",
    "stats": {
      "speed": 1,
      "damage": 1,
      "resistance": 1
    },
    "visual": "human"
  },
  {
    "id": "race_19",
    "name": "Reptiliano",
    "description": "Linaje provisional. +2 defense, +4 hp",
    "stats": {
      "defense": 2,
      "hp": 4
    },
    "visual": "human"
  }
];

const raceLabels={hp:'vida',damage:'daño',defense:'defensa',speed:'velocidad',energy:'energía',resistance:'resistencia'};
for(const r of races) r.description=Object.entries(r.stats).map(([k,v])=>`${v>0?'+':''}${v} ${raceLabels[k]}`).join(' · ');
