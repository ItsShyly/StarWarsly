// ^^^ Starship Constants - Game Configuration ^^^

// >>> Contains all game constants including cargo types, events, and exploration scenarios.
// >>> Defines economic values, probabilities, and gameplay mechanics.
// >>> Central configuration for the entire starship adventure system.

import type { CargoType, GameEvent, TieredExplorationEvent, InteractiveEvent, InteractiveEventResult } from "./types.js";


// vvv Physical Constants vvv
export const LIGHT_YEAR_TO_KM = 9.461e12;
export const HYPERSPACE_MULTIPLIER = 1e9;
export const BASE_SPEED = 1000;

// vvv Investment Tiers vvv
export const INVESTMENT_TIERS = {
  TIER_1: { min: 1, max: 100 },      // <<< Small risk, small reward
  TIER_2: { min: 101, max: 500 },    // <<< Medium risk, medium reward
  TIER_3: { min: 501, max: 1500 },   // <<< High risk, high reward
  TIER_4: { min: 1501, max: Infinity } // <<< Extreme risk, extreme reward
} as const;

// vvv Interactives vvv
// >>> Command Types
export const INTERACTIVE_CHANCE = {
  SAFE: 'safe',        // <<< higher success rate (lower rewards)
  NEUTRAL: 'neutral',   // <<< moderate success rate (balanced rewards)
  RISKY: 'risky',      // <<< lower success rate but (potentially higher rewards)
} as const;

// >>> Interactive Chance Mapping
export const INTERACTIVE_CHANCE_MAPPING: Record<string, string> = {
  shelter: INTERACTIVE_CHANCE.SAFE,
  run: INTERACTIVE_CHANCE.SAFE,
  hide: INTERACTIVE_CHANCE.SAFE,
  pay: INTERACTIVE_CHANCE.RISKY,
  fight: INTERACTIVE_CHANCE.RISKY,
  peace: INTERACTIVE_CHANCE.SAFE,
  buy: INTERACTIVE_CHANCE.RISKY,
  inspect: INTERACTIVE_CHANCE.SAFE,
  sneak: INTERACTIVE_CHANCE.RISKY,
  retreat: INTERACTIVE_CHANCE.SAFE,
  defend: INTERACTIVE_CHANCE.SAFE,
  strike: INTERACTIVE_CHANCE.RISKY,
  secure: INTERACTIVE_CHANCE.SAFE,
  boost: INTERACTIVE_CHANCE.RISKY,
  accept: INTERACTIVE_CHANCE.RISKY,
  decline: INTERACTIVE_CHANCE.SAFE,
};

// >>> Interactive Success Rates
export const INTERACTIVE_SUCCESS_RATES = {
  [INTERACTIVE_CHANCE.SAFE]: 0.8,     // <<< 80% success rate
  [INTERACTIVE_CHANCE.RISKY]: 0.4,    // <<< 40% success rate
  [INTERACTIVE_CHANCE.NEUTRAL]: 0.6   // <<< 60% success rate
} as const;

// >>> Interactive Helper Function
// >>> Determine the type of a command (good/risky/neutral)
export function getCommandType(command: string): string {
  return INTERACTIVE_CHANCE_MAPPING[command] || INTERACTIVE_CHANCE.NEUTRAL;
}

// >>> Command Success Rates
// >>> Get the success rate for a specific command
export function getSuccessRate(command: string): number {
  const chanceType = getCommandType(command);
  return INTERACTIVE_SUCCESS_RATES[chanceType as keyof typeof INTERACTIVE_SUCCESS_RATES] || INTERACTIVE_SUCCESS_RATES[INTERACTIVE_CHANCE.NEUTRAL];
}

// vvv Cargo System vvv
// >>> All tradeable items and functional equipment
export const CARGO_TYPES: Record<string, CargoType> = {
  Gewürz: { weight: 2, value: 50 },
  "Tibanna-Gas": { weight: 4, value: 100 },
  Kyberkristalle: { weight: 1, value: 120 },
  Droidenteile: { weight: 3, value: 80 },
  Blaster: { weight: 5, value: 70 },
  "Beskar-Barren": { weight: 4, value: 220 },
  "Medizinische Vorräte": { weight: 3, value: 60 },
  "Imperiale Rationen": { weight: 3, value: 40 },
  Holocrons: { weight: 1, value: 200 },
  "Antike Artefakte": { weight: 2, value: 300 },
  Kopfgeldverträge: { weight: 1, value: 90 },
  "Exotische Früchte": { weight: 4, value: 30 },
  Schmuggelware: { weight: 2, value: 180 },
  "Raumschiff-Bauteile": { weight: 5, value: 90 },
  Hyperraumkarten: { weight: 1, value: 180 },
  "Gefälschte credits": { weight: 1, value: 10 },
  "Sith-Texte": { weight: 1, value: 300 },
  "Klon-DNA-Proben": { weight: 1, value: 250 },
  "Porg-Eier": { weight: 1, value: 20 },
  "Bantha-Fleisch": { weight: 5, value: 55 },
  Sklaven: { weight: 70, value: 500 }, 
  Lebensmittelrationen: { weight: 3, value: 35 },
  "Rebellische Propaganda": { weight: 1, value: 70 },
  "Legendäre Holocron": { weight: 1, value: 500 },
  "Sith-Alchemie-Formeln": { weight: 1, value: 400 },
  "Hyperantrieb-Prototyp": { weight: 8, value: 800 },
  "Jedi-Lichtschwert": { weight: 2, value: 600 },
  "Imperiale Geheimdokumente": { weight: 1, value: 350 },
  "Quantenkristalle": { weight: 1, value: 450 },
  "Mandalore-Erbe": { weight: 3, value: 700 },
  
  // >>> Functional Items
  "Solar-Kollektor": { 
    weight: 15, 
    value: 800, 
    functional: { type: 'fuel_generator', effect: 2 } // <<< 2% fuel per hour
  },
  "Treibstoff-Recycler": { 
    weight: 25, 
    value: 1200, 
    functional: { type: 'fuel_generator', effect: 3 } // <<< 3% fuel per hour
  },
  "Mining-Droid": { 
    weight: 30, 
    value: 1500, 
    functional: { type: 'credit_generator', effect: 15 } // <<< 15 credits per hour
  },
  "Handels-KI": { 
    weight: 100, 
    value: 2000, 
    functional: { type: 'credit_generator', effect: 25 } // <<< 25 credits per hour
  },
  "Hyperantrieb-Booster": {  
    weight: 40, 
    value: 2500, 
    functional: { type: 'speed_booster', effect: 200 } // <<< +200 ly/h permanent
  },
  "Astromech-Droid": { 
    weight: 80, 
    value: 500, 
    functional: { type: 'repair_droid', effect: 1 } // <<< -1% damage per hour
  },
  "Wartungs-Droid": { 
    weight: 120, 
    value: 1000, 
    functional: { type: 'repair_droid', effect: 2 } // <<< -2% damage per hour
  },
  
  // >>> Consumable Functional Items
  "Notfall-Brennstoffzelle": { 
    weight: 8, 
    value: 300, 
    functional: { type: 'fuel_generator', effect: 10, duration: 1 } // <<< 10% fuel after 1 hour, then consumed
  },
  "Stimulanten": { 
    weight: 1, 
    value: 150, 
    functional: { type: 'speed_booster', effect: 500, duration: 2 } // <<< +500 ly/h for 2 hours
  },
    "Basis-Energiezelle": { 
    weight: 5, 
    value: 200, 
    functional: { type: 'fuel_generator', effect: 1 } // <<< 1% fuel per hour - cheap option
  },
  "Handels-Terminal": { 
    weight: 10, 
    value: 800, 
    functional: { type: 'credit_generator', effect: 8 } // <<< 8 credits per hour - mid-tier
  },
  "Leichter Booster": { 
    weight: 20, 
    value: 1000, 
    functional: { type: 'speed_booster', effect: 150 } // <<< +150 ly/h permanent - affordable speed
  },
  "Reparatur-Kit": { 
    weight: 15, 
    value: 250, 
    functional: { type: 'repair_droid', effect: 0.5 } // <<< -0.5% damage per hour - basic repair
  },
    "Energie-Drink": { 
    weight: 0.5, 
    value: 80, 
    functional: { type: 'speed_booster', effect: 200, duration: 1 } // <<< +200 ly/h for 1 hour
  },
  "Notfall-Reparatur": { 
    weight: 3, 
    value: 250, 
    functional: { type: 'repair_droid', effect: 5, duration: 1 } // <<< -5% damage after 1 hour, then consumed
  }
};

// vvv Event System vvv
// >>> Planet landing events
export const LANDING_EVENTS: GameEvent[] = [
  {
    emoji: "📦",
    text: "Exotische Gewürze gefunden!",
    addCargo: { item: "Gewürz", quantity: 2 },
  },
  {
    emoji: "🛠️",
    text: "5% Schaden in der örtlichen Raumstation repariert",
    damage: -5,
  },
  {
    emoji: "🎰",
    text: "50 credits beim Glücksspiel in der Cantina verloren",
    credits: -50,
  },
  {
    emoji: "🎉",
    text: "Glück bei Sabacc! 50 credits gewonnen",
    credits: 50,
  },
  {
    emoji: "⛽",
    text: "Am Raumhafen 20% Treibstoff aufgetankt",
    fuel: 20,
  },
  {
    emoji: "💧",
    text: "Verunreinigtes Treibstoff getankt - 20% Tank verloren",
    fuel: -20,
  },
  {
    emoji: "👾",
    text: "Einheimische Diebe haben eine Fracht gestohlen!",
    removeCargo: true,
  },
  {
    emoji: "🛡️",
    text: "Lokale Sicherheitsdroide haben einen Diebstahl verhindert - nichts verloren",
  },
  {
    emoji: "💸",
    text: "Seltenes Artefakt verkauft +200 credits erhalten!",
    credits: 200,
  },
  {
    emoji: "🧱",
    text: "Ausversehen versucht gefälschtes Artefakt zu verkaufen -200 credits Strafe gezahlt",
    credits: -200,
  },
  {
    emoji: "🥩",
    text: "Du tauschst Bantha-Fleisch gegen Droidenteile +1 Droidenteil erhalten",
    addCargo: { item: "Droidenteile", quantity: 1 },
  },
  {
    emoji: "🤢",
    text: "Verdorbenes Bantha-Fleisch - du musstest es teuer entsorgen (-50 credits)",
    credits: -50,
  },
  {
    emoji: "👁️",
    text: "Ein Jedi-Spion belohnt deine Diskretion +100 credits erhalten",
    credits: 100,
  },
  {
    emoji: "🕵️",
    text: "Ein imperialer Informant verpetzt dich -100 credits Bestechung gezahlt",
    credits: -100,
  },
  {
    emoji: "🐀",
    text: "Ein Jawaschiff verkauft dir Ersatzteile 10% Schaden repariert",
    damage: -10,
  },
  {
    emoji: "🐍",
    text: "Rattenähnliche Kreatur hat Kabel angenagt +10% Schaden am Schiff",
    damage: 10,
  },
];

// >>> Tiered exploration events with risk/reward scaling
export const TIERED_EXPLORATION_EVENTS: TieredExplorationEvent[] = [
    // vvv Common Events vvv
  {
    emoji: "💰",
    text: "Alte Sith-Relikte entdeckt!",
    credits: 80, 
    rarity: "common",
    minTier: 1,
    flavorText: {
      1: "Du sendest eine einfache Sonde aus und entdeckst oberflächliche Ruinen...",
      2: "Mit besserer Ausrüstung durchsuchst du die antiken Strukturen gründlicher...", 
      3: "Deine fortschrittlichen Scanner enthüllen verborgene Kammern...",
      4: "Du riskierst alles und dringst in die gefährlichsten Bereiche vor..."
    }
  },
  {
    emoji: "💥", 
    text: "Ein Sith-Artefakt explodierte",
    credits: -60,
    damage: 3,
    rarity: "common",
    minTier: 1,
    flavorText: {
      1: "Deine einfache Sonde löst eine kleine Explosion aus...",
      2: "Ein instabiles Artefakt detoniert während der Untersuchung...",
      3: "Die intensive Analyse aktiviert gefährliche Sith-Magie...", 
      4: "Du störst mächtige dunkle Kräfte, die sich rächen..."
    }
  },
  {
    emoji: "📦",
    text: "Wertvolle Droidenteile gefunden!",
    addCargo: { item: "Droidenteile", quantity: 1 },
    rarity: "common",
    minTier: 1,
    flavorText: {
      1: "Du findest basic Droidenteile an der Oberfläche...",
      2: "Sorgfältige Suche enthüllt qualitativ hochwertige Komponenten...",
      3: "Tiefere Ausgrabungen fördern seltene Droidenteile zutage...",
      4: "Du entdeckst prototypische Droidentechnologie..."
    }
  },
  {
    emoji: "💥",
    text: "Eine instabile Energiezelle detonierte nach der Bergung",
    removeCargo: true,
    rarity: "common", 
    minTier: 1,
    flavorText: {
      1: "Eine alte Batterie explodiert bei der Bergung...",
      2: "Ein Energieüberschuss zerstört deine Fracht...",
      3: "Hochenergetische Instabilität vernichtet wertvolle Güter...",
      4: "Katastrophale Energieentladung verwüstet dein Frachtraum..."
    }
  },
  {
    emoji: "🪐",
    text: "Die Erkundung brachte keine Ergebnisse",
    credits: 0,
    rarity: "common",
    minTier: 1,
    flavorText: {
      1: "Deine oberflächliche Suche war meist erfolglos, aber du findest kleine Wertgegenstände...",
      2: "Trotz gründlicher Untersuchung nur geringe Funde...",
      3: "Selbst fortschrittliche Scanner entdecken nur wenig Interessantes...",
      4: "Trotz extremer Risiken nur minimale Entdeckungen..."
    }
  },
   {
    emoji: "⚔️",
    text: "Sklavenaufstand an Bord!",
    damage: 15,
    removeCargo: true,
    rarity: "common",
    minTier: 1,
    flavorText: {
      1: "Die Sklaven rebellieren und richten Schaden an, bevor sie entkommen...",
      2: "Eine schlecht gesicherte Sklavengruppe überwältigt die Wachen...",
      3: "Organisierter Aufstand befreit die Sklaven und beschädigt Systeme...",
      4: "Die Sklaven verbünden sich mit Piraten und übernehmen Teile des Schiffs..."
    }
  },
  {
    emoji: "🌪️",
    text: "Planetarer Sturm erschwert die Erkundung",
    credits: -40,
    damage: 5,
    rarity: "common",
    minTier: 1,
    flavorText: {
      1: "Plötzliche Stürme zwingen dich zum Abbruch der Mission...",
      2: "Elektromagnetische Stürme beschädigen deine Sensoren...",
      3: "Toxische Wirbelstürme zwingen dich zu teuren Umwegen...",
      4: "Hyperenergetische Stürme drohen dein Schiff zu zerreißen..."
    }
  },
    {
    emoji: "🪙",
    text: "Leider keine nennenswerten Funde gemacht",
    credits: 60,
    damage: 0,
    rarity: "common",
    minTier: 1,
    flavorText: {
      1: "Du findest jedoch einige verlorene Credits auf dem Weg...",
    }
  },

  // vvv Rare Events vvv 
  {
    emoji: "🌌",
    text: "Wurmloch-Abenteuer! Große Belohnung, aber gefährlich",
    credits: 120,
    damage: 8, 
    rarity: "rare",
    minTier: 2,
    flavorText: {
      2: "Du entdeckst eine instabile Raum-Zeit-Anomalie...",
      3: "Mit besserer Ausrüstung erkundest du das Wurmloch sicherer...",
      4: "Du tauchst vollständig in das chaotische Wurmloch ein..."
    }
  },
  {
    emoji: "💎",
    text: "Kyberkristalle entdeckt!",
    addCargo: { item: "Kyberkristalle", quantity: 1 },
    credits: 50,
    rarity: "rare",
    minTier: 2,
    flavorText: {
      2: "Deine Suche enthüllt schwach leuchtende Kristalle...",
      3: "Tiefe Scanner entdecken reine Kyberkristall-Vorkommen...",
      4: "Du findest einen legendären Kristall von unglaublicher Macht..."
    }
  },
  {
    emoji: "🤝",
    text: "Schattiger Händler bietet dubiose Waren an",
    addCargo: { item: "Schmuggelware", quantity: 1 },
    credits: -80,
    rarity: "rare",
    minTier: 2,
    flavorText: {
      2: "Ein zwielichtiger Händler verkauft dir suspekte Güter...",
      3: "Du erwirbst illegale Ware von einem verdeckten Händler...",
      4: "Ein krimineller Boss bietet dir geschmuggelte High-Tech-Ware..."
    }
  },


  // vvv Epic Events vvv
  {
    emoji: "📜", 
    text: "Sith-Texte gefunden! Extrem wertvolle Erkenntnisse",
    addCargo: { item: "Sith-Texte", quantity: 1 },
    credits: 200,
    rarity: "epic",
    minTier: 3,
    flavorText: {
      3: "Du entdeckst eine verborgene Sith-Bibliothek...",
      4: "In den tiefsten Gewölben findest du uralte Sith-Geheimnisse..."
    }
  },
     {
    emoji: "🛸",
    text: "Aufgegebenes Sklavenschiff entdeckt",
    addCargo: { item: "Sklaven", quantity: 1 },
    credits: 400,
    rarity: "epic",
    minTier: 3,
    flavorText: {
      3: "Ein geisterhaftes Schiff gibt seine menschliche Fracht preis...",
      4: "Du entdeckst ein intaktes Sklavenschiff mit wertvoller Fracht..."
    }
  },
  {
    emoji: "⚡",
    text: "Imperiale Geheimtechnologie entdeckt!",
    addCargo: { item: "Imperiale Geheimdokumente", quantity: 1 },
    credits: 300,
    rarity: "epic", 
    minTier: 3,
    flavorText: {
      3: "Du findest eine verlassene imperiale Forschungsstation...",
      4: "In den Ruinen entdeckst du streng geheime Projekte..."
    }
  },
  {
    emoji: "🎭",
    text: "Sklavenhändler-Ring getroffen",
    addCargo: { item: "Sklaven", quantity: 2 },
    credits: 200,
    damage: 10,
    rarity: "epic",
    minTier: 3,
    flavorText: {
      3: "Du stößt auf einen Sklavenhändler-Ring und erbeutest ihre Fracht...",
      4: "Ein brutaler Kampf mit Sklavenhändlern bringt Beute und Schaden..."
    }
  },
  {
    emoji: "🔮",
    text: "Verbotene Sith-Alchemie entdeckt",
    addCargo: { item: "Sith-Alchemie-Formeln", quantity: 1 },
    credits: 150,
    rarity: "epic",
    minTier: 3,
    flavorText: {
      3: "Versteckte Laboratorien enthüllen uralte Sith-Alchemie...",
      4: "Du findest die verlorenen Formeln eines Sith-Alchemisten..."
    }
  },

  // vvv Legendary Events vvv
  {
    emoji: "👑",
    text: "Legendäre Holocron eines Sith-Lords entdeckt!",
    addCargo: { item: "Legendäre Holocron", quantity: 1 },
    credits: 0, 
    rarity: "legendary",
    minTier: 4,
    flavorText: {
      4: "Du riskierst alles und findest das persönliche Holocron eines Sith-Lords..."
    }
  },
  {
    emoji: "🌟",
    text: "Hyperantrieb-Prototyp gefunden! Revolutionäre Technologie",
    addCargo: { item: "Hyperantrieb-Prototyp", quantity: 1 },
    credits: 0,
    rarity: "legendary",
    minTier: 4,
    flavorText: {
      4: "In einer geheimen Forschungsanlage entdeckst du experimentelle Technologie..."
    }
  },
  {
    emoji: "💎",
    text: "Quantenkristall-Mine entdeckt! Unschätzbare Entdeckung", 
    addCargo: { item: "Quantenkristalle", quantity: 2 },
    credits: 0,
    rarity: "legendary",
    minTier: 4,
    flavorText: {
      4: "Du entdeckst eine Mine mit den seltensten Kristallen der Galaxis..."
    }
  },
  {
    emoji: "⚔️",
    text: "Mandalorianischer Erbe gefunden",
    addCargo: { item: "Mandalore-Erbe", quantity: 1 },
    credits: 400,
    rarity: "legendary",
    minTier: 4,
    flavorText: {
      4: "Du entdeckst das legendäre Erbe der Mandalorianer..."
    }
  },
  {
    emoji: "✨",
    text: "Jedi-Relikte geborgen",
    addCargo: { item: "Jedi-Lichtschwert", quantity: 1 },
    credits: 300,
    rarity: "legendary",
    minTier: 4,
    flavorText: {
      4: "Eine versteckte Jedi-Zitadelle gibt ihre Schätze preis..."
    }
  },
  {
    emoji: "🔋",
    text: "Verlassene Energieanlage entdeckt",
    addCargo: { item: "Solar-Kollektor", quantity: 1 },
    credits: 200,
    rarity: "rare",
    minTier: 2,
    flavorText: {
      2: "Du findest eine alte, aber funktionsfähige Solaranlage... (+2% fuel/h)",
      3: "Fortschrittliche Energietechnologie wartet auf Bergung... (+2% fuel/h)",
      4: "Ein hochmoderner Solar-Kollektor liegt vor dir... (+2% fuel/h)"
    }
  },
  {
    emoji: "🤖",
    text: "Astromech-Droid repariert und aktiviert",
    addCargo: { item: "Astromech-Droid", quantity: 1 },
    credits: 100,
    rarity: "epic",
    minTier: 3,
    flavorText: {
      3: "Du findest einen beschädigten Astromech und reparierst ihn... (-1% dmg/h)",
      4: "Ein seltener Prototyp-Droid wartet auf Aktivierung... (-1% dmg/h)"
    }
  },
  {
    emoji: "⚡",
    text: "Hyperantrieb-Komponenten geborgen",
    addCargo: { item: "Hyperantrieb-Booster", quantity: 1 },
    credits: 500,
    rarity: "legendary",
    minTier: 4,
    flavorText: {
      4: "Du entdeckst experimentelle Hyperantrieb-Technologie... (+200 ly/h)"
    }
  },
  {
    emoji: "🌠",
    text: "Interplanetarer Sklavenmarkt",
    addCargo: { item: "Sklaven", quantity: 3 },
    credits: 500,
    rarity: "legendary",
    minTier: 4,
    flavorText: {
      4: "Du stößt auf einen geheimen Sklavenmarkt zwischen den Planeten..."
    }
  },
  {
    emoji: "💫",
    text: "Galaktischer Schatz der Sklaverei",
    addCargo: { item: "Sklaven", quantity: 2 },
    credits: 600,
    rarity: "legendary",
    minTier: 4,
    flavorText: {
      4: "Du findest den legendären Schatz eines Sklavenhändler-Königs..."
    }
  },
  // vvv Functional Item Discovery Events vvv
  {
    emoji: "⛽",
    text: "Treibstoff-Recycler in Wrack gefunden",
    addCargo: { item: "Treibstoff-Recycler", quantity: 1 },
    credits: 150,
    rarity: "epic",
    minTier: 3,
    flavorText: {
      3: "Ein zerstörtes Bergbauschiff enthält noch funktionsfähige Recycling-Technologie... (+3% fuel/h)",
      4: "Du bergst fortschrittlichste Treibstoff-Recycling-Ausrüstung... (+3% fuel/h)"
    }
  },
  {
    emoji: "⛏️",
    text: "Mining-Droid reaktiviert",
    addCargo: { item: "Mining-Droid", quantity: 1 },
    credits: 200,
    rarity: "epic",
    minTier: 3,
    flavorText: {
      3: "Du entdeckst einen deaktivierten Mining-Droid und bringst ihn wieder zum Laufen... (15 cr/h)",
      4: "Ein seltener Prototyp-Mining-Droid wartet auf Reaktivierung... (15 cr/h)"
    }
  },
  {
    emoji: "🧠",
    text: "Handels-KI-Core entdeckt",
    addCargo: { item: "Handels-KI", quantity: 1 },
    credits: 300,
    rarity: "legendary",
    minTier: 4,
    flavorText: {
      4: "Eine verlassene Handelsstation enthält eine hochentwickelte KI... (25 cr/h)"
    }
  },
  {
    emoji: "🔧",
    text: "Wartungs-Droid-Fabrik gefunden",
    addCargo: { item: "Wartungs-Droid", quantity: 1 },
    credits: 400,
    rarity: "legendary",
    minTier: 4,
    flavorText: {
      4: "Eine geheime Droidenfabrik produziert noch immer Wartungsdroids... (-2% dmg/h)"
    }
  },
  {
    emoji: "💊",
    text: "Notfall-Brennstoffzellen gefunden",
    addCargo: { item: "Notfall-Brennstoffzelle", quantity: 2 },
    credits: 80,
    rarity: "rare",
    minTier: 2,
    flavorText: {
      2: "Ein Notfallkit enthält noch verwendbare Brennstoffzellen...",
      3: "Hochwertige Notfall-Energiezellen in einem Rettungskapsel...",
      4: "Militärische Notfall-Brennstoffzellen mit extremer Leistung..."
    }
  },
  {
    emoji: "💉",
    text: "Stimulanten-Vorrat entdeckt",
    addCargo: { item: "Stimulanten", quantity: 1 },
    credits: 50,
    rarity: "rare",
    minTier: 2,
    flavorText: {
      2: "Du findest einen Vorrat an Leistungsstimulanten...",
      3: "Hochreine Stimulanten aus einem Schmugglerversteck...",
      4: "Experimentelle Kampfstimulanten aus einem geheimen Labor..."
    }
  },
  {
    emoji: "🔋",
    text: "Basis-Energiezelle geborgen",
    addCargo: { item: "Basis-Energiezelle", quantity: 1 },
    credits: 30,
    rarity: "common",
    minTier: 1,
    flavorText: {
      1: "Eine einfache, aber funktionsfähige Energiezelle...",
      2: "Verbesserte Basis-Energiezelle mit höherer Kapazität...",
      3: "Professionelle Energiezelle aus einer Raumstation...",
      4: "Militärische Basis-Energiezelle mit Langzeitleistung..."
    }
  },
  {
    emoji: "💼",
    text: "Handels-Terminal gefunden",
    addCargo: { item: "Handels-Terminal", quantity: 1 },
    credits: 120,
    rarity: "rare",
    minTier: 2,
    flavorText: {
      2: "Ein tragbares Handels-Terminal aus einem verlassenen Außenposten...",
      3: "Fortschrittliches Handels-Terminal mit Galaxienweiten Verbindungen...",
      4: "Schwarzmarkt-Terminal mit Zugang zu illegalen Handelsrouten..."
    }
  },
  {
    emoji: "🚀",
    text: "Leichter Booster entdeckt",
    addCargo: { item: "Leichter Booster", quantity: 1 },
    credits: 200,
    rarity: "epic",
    minTier: 3,
    flavorText: {
      3: "Ein kompakter Geschwindigkeitsbooster liegt in den Trümmern...",
      4: "Experimenteller Leichtbau-Booster mit überlegener Technologie..."
    }
  },
  {
    emoji: "🛠️",
    text: "Reparatur-Kit gefunden",
    addCargo: { item: "Reparatur-Kit", quantity: 1 },
    credits: 80,
    rarity: "common",
    minTier: 1,
    flavorText: {
      1: "Ein Standard-Reparaturkit aus einem Notfallvorrat... (-0.5% dmg/h)",
      2: "Verbessertes Reparatur-Kit mit speziellen Werkzeugen... (-0.5% dmg/h)",
      3: "Professionelles Reparatur-Kit von einer Werft... (-0.5% dmg/h)",
      4: "Militärisches Schlachtfeld-Reparatur-Kit... (-0.5% dmg/h)"
    }
  },
  {
    emoji: "⚡",
    text: "Energie-Drink-Kiste entdeckt",
    addCargo: { item: "Energie-Drink", quantity: 3 },
    credits: 40,
    rarity: "common",
    minTier: 1,
    flavorText: {
      1: "Eine Kiste mit Energie-Drinks aus einem Frachtraum...",
      2: "Hochwertige Piloten-Energie-Drinks...",
      3: "Spezielle Racer-Energie-Drinks mit verbesserter Formel...",
      4: "Experimentelle Kampfpiloten-Stimulanzien..."
    }
  },
  {
    emoji: "🆘",
    text: "Notfall-Reparatur-Kits geborgen",
    addCargo: { item: "Notfall-Reparatur", quantity: 2 },
    credits: 100,
    rarity: "rare",
    minTier: 2,
    flavorText: {
      2: "Notfall-Reparatur-Kits aus einem abgestürzten Rettungsschiff...",
      3: "Hochwertige Sofort-Reparatur-Systeme...",
      4: "Militärische Schlachtfeld-Reparatur-Einheiten..."
    }
  }
];

// vvv Interactive Event Scaling Configuration vvv
// >>> Defines how interactive events scale with investment amount
export const INTERACTIVE_SCALING = {
  // >>> Base scaling factors for different outcomes
  SUCCESS_MULTIPLIER: 0.4,    // <<< average of 40% of investment on success
  FAILURE_MULTIPLIER: 0.6,    // <<< average of 60% of investment on failure
  TIMEOUT_MULTIPLIER: 0.8,    // <<< average of 80% of investment on timeout

  // >>> Rare event chances (very low probability)
  RARE_SUCCESS_CHANCE: 0.05,  // <<< average of 5% chance for big win
  RARE_FAILURE_CHANCE: 0.03,  // <<< average of 3% chance for big loss
  RARE_SUCCESS_MULTIPLIER: 2.5, // <<< average of 250% of investment on rare success
  RARE_FAILURE_MULTIPLIER: 1.5, // <<< average of 150% of investment on rare failure

  // >>> Randomness variation range
  RANDOM_VARIATION: 0.4,       // <<< ±20% variation (0.8 to 1.2 multiplier)
} as const;

// vvv Interactive Event Scaling Function vvv
// >>> Utility function to scale interactive event results based on investment and tier
export function scaleInteractiveEventResult(
  baseResult: InteractiveEventResult, 
  investmentAmount: number, 
  tier: number,
  eventType: 'SUCCESS' | 'FAILURE' | 'TIMEOUT' = 'SUCCESS',
  isRareEvent: boolean = false
): InteractiveEventResult {
  const scaling = INTERACTIVE_SCALING;
  
  // >>> Determine credit multiplier based on event type and rarity
  let creditMultiplier = 0;
  switch(eventType) {
    case 'SUCCESS':
      creditMultiplier = isRareEvent ? scaling.RARE_SUCCESS_MULTIPLIER : scaling.SUCCESS_MULTIPLIER;
      break;
    case 'FAILURE':
      creditMultiplier = isRareEvent ? -scaling.RARE_FAILURE_MULTIPLIER : -scaling.FAILURE_MULTIPLIER;
      break;
    case 'TIMEOUT':
      creditMultiplier = -scaling.TIMEOUT_MULTIPLIER;
      break;
  }
  
  // >>> Add randomness: ±20% variation  
  const randomVariation = scaling.RANDOM_VARIATION;
  const randomFactor = (1 - randomVariation/2) + (Math.random() * randomVariation); // 0.8 to 1.2
  const scaledCredits = Math.floor(investmentAmount * creditMultiplier * randomFactor);
  
  // >>> Create scaled result with all original properties preserved
  const scaledResult: InteractiveEventResult = {
    ...baseResult,
    credits: scaledCredits + (baseResult.credits || 0), // scale credits
    damage: baseResult.damage || 0,     // Keep original damage
    fuel: baseResult.fuel || 0,         // Keep original fuel
    addCargo: baseResult.addCargo,
    removeCargo: baseResult.removeCargo 
  };
  
  // >>> Log scaling for debugging
  console.log(`💰 Interactive Event Scaling: Investment=${investmentAmount}, Type=${eventType}, Rare=${isRareEvent}`);
  console.log(`   Multiplier=${creditMultiplier}, Random=${randomFactor.toFixed(2)}, Final Credits=${scaledResult.credits}`);
  
  return scaledResult;
}

// vvv Investment Tier Helper Function vvv
// >>> Determine which investment tier an amount falls into
export function getInvestmentTier(amount: number): number {
  if (amount >= INVESTMENT_TIERS.TIER_4.min) return 4;
  if (amount >= INVESTMENT_TIERS.TIER_3.min) return 3;
  if (amount >= INVESTMENT_TIERS.TIER_2.min) return 2;
  return 1;
}

// vvv Rare Event Chance Calculator vvv
// >>> Determine if a rare event should occur based on random chance
export function shouldTriggerRareEvent(eventType: 'SUCCESS' | 'FAILURE'): boolean {
  const random = Math.random();
  const chance = eventType === 'SUCCESS' ? 
    INTERACTIVE_SCALING.RARE_SUCCESS_CHANCE : 
    INTERACTIVE_SCALING.RARE_FAILURE_CHANCE;
  return random < chance;
}

// vvv Interactive Events vvv
// >>> Time-limited events requiring player response
// >>> NOTE: Credit values in these events are BASE values that get scaled with randomness
// >>> Credits scale: Success +40%, Failure -60%, Timeout -80% of investment
// >>> Rare events (5% success, 3% failure): Success +250%, Failure -150%
export const INTERACTIVE_EVENTS: InteractiveEvent[] = [
  {
    id: "sandstorm_escape",
    emoji: "🌪️",
    text: "SANDSTURM-ALARM! Ionische Sandwolke nähert sich mit 500 km/h. Nächstgelegener Schutz: Canyon in Reichweite. Eingabe #shelter erforderlich in T-30 Sekunden!",
    timeLimit: 30,
    successCommand: "shelter",
    successResult: {
      text: "Notmanöver erfolgreich! Canyon bietet Schutz. Sturm hinterlässt verwertbare Kristallfragmente an der Außenhülle.",
      emoji: "🏠",
      damage: 0,
      credits: 0
    },
    failureResult: {
      text: "Zu spät! Sandsturm erfasst das Schiff. Quartzsand dringt in Antriebssysteme ein - erheblicher Schaden!",
      emoji: "💥",
      damage: 20,
      credits: 0
    },
    timeoutResult: {
      text: "KEINE REAKTION ERKANNT! Sandsturm verursacht strukturellen Schaden an Hülle und Sensoren.",
      emoji: "⏰",
      damage: 29,
      credits: 0
    }
  },
  {
    id: "bounty_hunter_trap",
    emoji: "🎯",
    text: "AKTIVE VERFOLGUNG! Frequenzmuster identifiziert Kopfgeldjäger-Schiff vom Typ Firespray. Eingabe #run für Notstart in T-25 Sekunden!",
    timeLimit: 25,
    successCommand: "run",
    successResult: {
      text: "Triebwerkszündung im letzten Moment - Entkommen erfolgreich! Fluchtmanöver liefert wertvolle Scannerdaten.",
      emoji: "🚀",
      damage: 0,
      credits: 0
    },
    failureResult: {
      text: "Einkreisung komplett! Kopfgeldjäger erzwingen Energiekredit-Transfer für Freigabe.",
      emoji: "💸",
      damage: 0, 
      credits: 0
    },
    timeoutResult: {
      text: "ALARM: Enterdroiden detektiert! Piraten plündern Frachtraum und beschädigen Systeme.",
      emoji: "⏰",
      damage: 20, 
      credits: 0
    }
  },
  {
    id: "imperial_patrol",
    emoji: "⚔️",
    text: "IMPERIALE KONTROLLE! TIE-Jäger nähern sich zur Inspektion. Eingabe #hide für Asteroidenmanöver oder #pay für 'administrative Gebühr' in T-25 Sekunden!",
    timeLimit: 25,
    successCommand: ["hide", "pay"],
    successResult: {
      hide: {
        text: "Asteroidenfeld bietet perfekte Tarnung. Nebenbei seltene Mineralien entdeckt!",
        emoji: "👤",
        damage: 0,
        credits: 0
      },
      pay: {
        text: "Credits akzeptiert. Imperialer Kommandant gibt 'freiwillig' Handelsrouten-Informationen preis.",
        emoji: "💰",
        damage: 0,
        credits: -25
      }
    },
    failureResult: {
      text: "Durchsuchung abgeschlossen. 'Nicht konforme Fracht' festgestellt - Beschlagnahmung und Strafe!",
      emoji: "💥",
      damage: 0,
      credits: 0
    },
    timeoutResult: {
      text: "KEINE KOMMUNIKATION ERKANNT! Imperialer Warnschuss trifft Schildgenerator.",
      emoji: "⏰",
      damage: 20,
      credits: 0
    }
  },
  {
    id: "cantina_fight",
    emoji: "🍺",
    text: "CANTINA-VORFALL! Betrunkenes Rodian provoziert Konfrontation. Eingabe #fight für Kampf oder #peace für Deeskalation in T-30 Sekunden!",
    timeLimit: 30,
    successCommand: ["fight", "peace"],
    successResult: {
      fight: {
        text: "Kampf gewonnen! Cantina-Gäste respektieren Stärke und teilen wertvolle Handelsinformationen.",
        emoji: "👊",
        damage: 0,
        credits: 0
      },
      peace: {
        text: "Diplomatische Lösung erfolgreich. Rodian entschuldigt sich und bietet Wiedergutmachung an.",
        emoji: "🤝",
        damage: 0,
        credits: 0
      }
    },
    failureResult: {
      text: "Situation eskaliert! Cantina-Schlägerei beschädigt Schiffssysteme während du abgelenkt bist.",
      emoji: "💔",
      damage: 9, 
      credits: 0
    },
    timeoutResult: {
      text: "KEINE ENTSCHEIDUNG GETROFFEN! Rodian und seine Crew greifen an und verursachen Schäden.",
      emoji: "⏰",
      damage: 0,
      credits: 0
    }
  },
  {
    id: "jawa_traders",
    emoji: "👥",
    text: "JAWA-HÄNDLER! Utinni! Bieten 'erstklassige' Ersatzteile an. Eingabe #buy für Kauf oder #inspect für Überprüfung in T-35 Sekunden!",
    timeLimit: 35,
    successCommand: ["buy", "inspect"],
    successResult: {
      buy: {
        text: "Kauf erfolgreich! Überraschenderweise sind Teile von guter Qualität und reparieren leichte Schäden.",
        emoji: "🛠️",
        damage: -10,
        credits: 0
      },
      inspect: {
        text: "Vorsicht zahlt sich aus! Defekte Teile entdeckt - Jawas geben Rabatt für ehrliche Teile.",
        emoji: "🔍",
        damage: -5,
        credits: 0
      }
    },
    failureResult: {
      text: "Jawas fühlen sich betrogen! Sie sabotieren leichtes System als Rache bevor sie verschwinden.",
      emoji: "😤",
      damage: 0,
      credits: 0
    },
    timeoutResult: {
      text: "ZAUDERN KOSTET! Jawas verlieren Interesse und nehmen ein paar lose Teile beim Gehen mit.",
      emoji: "⏰",
      damage: 5,
      credits: 0
    }
  },
  {
    id: "krayt_dragon_den",
    emoji: "🐉",
    text: "KRAYT-DRACHEN-HÖHLE! Lebenszeichen detektiert aber wertvolle Perlen sichtbar. Eingabe #sneak für Schleichen oder #retreat für Rückzug in T-25 Sekunden!",
    timeLimit: 25,
    successCommand: ["sneak", "retreat"],
    successResult: {
      sneak: {
        text: "Schleichmanöver erfolgreich! Einige Krayt-Drachen-Perlen geborgen ohne den Drachen zu wecken.",
        emoji: "💎",
        damage: 0,
        credits: 0,
        addCargo: { item: "Antike Artefakte", quantity: 1 }
      },
      retreat: {
        text: "Rückzug klug gewählt! Sensoren zeigen, dass der Drache vollständig erwacht ist - Gefahr gebannt.",
        emoji: "🚶",
        damage: 0,
        credits: 0
      }
    },
    failureResult: {
      text: "Drache bemerkt Eindringling! Hastiger Rückzug verursacht Hüllenschaden.",
      emoji: "🐲",
      damage: 9,
      credits: 0
    },
    timeoutResult: {
      text: "ZU LANGSAM! Krayt-Drache erwacht vollständig und greift mit verheerender Wucht an!",
      emoji: "⏰",
      damage: 27,
      credits: 0
    }
  },
  {
    id: "space_pirate_ambush",
    emoji: "🏴‍☠️",
    text: "PIRATEN-ÜBERFALL! Bewaffnete Schiffe aus dem Hyperraum aufgetaucht. Eingabe #defend für Schilde oder #strike für Gegenangriff in T-30 Sekunden!",
    timeLimit: 30,
    successCommand: ["defend", "strike"],
    successResult: {
      defend: {
        text: "Schildverstärkung hält Stand! Piraten ziehen sich nach erfolglosem Angriff zurück.",
        emoji: "🛡️",
        damage: 5,
        credits: 0
      },
      strike: {
        text: "Gezielter Angriff trifft Reaktor! Piratenschiff explodiert und hinterlässt verwertbares Wrackmaterial.",
        emoji: "💥",
        damage: 8,
        credits: 0,
        addCargo: { item: "Raumschiff-Bauteile", quantity: 1 }
      }
    },
    failureResult: {
      text: "Piraten durchbrechen Verteidigung! Enterdroiden plündern Fracht bevor du sie abschüttelst.",
      emoji: "☠️",
      damage: 10,
      credits: 0
    },
    timeoutResult: {
      text: "UNENTSCHLOSSENHEIT BESTRAFT! Piraten nutzen Verzögerung für koordinierten Angriff auf ungeschützte Systeme.",
      emoji: "⏰",
      damage: 21,
      credits: 0
    }
  },
  {
    id: "toxic_gas_leak",
    emoji: "☠️",
    text: "GIFTGAS-ALARM! Toxisches Leck auf Station kontaminiert Lebenserhaltung. Eingabe #secure für Lukenversiegelung oder #boost für Triebwerksreinigung in T-40 Sekunden!",
    timeLimit: 40,
    successCommand: ["secure", "boost"],
    successResult: {
      secure: {
        text: "Luken erfolgreich versiegelt! Giftgas blockiert. Bei der Sicherung wertvolle Chemikalien geborgen.",
        emoji: "🚪",
        damage: 0,
        credits: 0,
        addCargo: { item: "Medizinische Vorräte", quantity: 1 }
      },
      boost: {
        text: "Triebwerksstrahl-Manöver erfolgreich! Gas weggeblasen mit minimalem Hüllenschaden.",
        emoji: "🌀",
        damage: 3,
        credits: 0
      }
    },
    failureResult: {
      text: "Giftgas dringt ein! Teure Dekontaminationsmaßnahmen erforderlich.",
      emoji: "🤢",
      damage: 3,
      credits: 0
    },
    timeoutResult: {
      text: "ENTSCHEIDUNGSDILEMMA! Gas kontaminiert kritische Systeme - umfangreiche Reparaturen nötig.",
      emoji: "⏰",
      damage: 12,
      credits: 0
    }
  },
  {
    id: "rebel_spy_contact",
    emoji: "🕵️",
    text: "VERSCHLÜSSELTES REBELLENSIGNAL! Riskanter Kurierauftrag angeboten. Eingabe #accept für Annahme oder #decline für Ablehnung in T-35 Sekunden!",
    timeLimit: 35,
    successCommand: ["accept", "decline"],
    successResult: {
      accept: {
        text: "Auftrag angenommen! Spion überweist Vorschuss und überträgt verschlüsselte Daten.",
        emoji: "📊",
        damage: 0,
        credits: 0,
        addCargo: { item: "Rebellische Propaganda", quantity: 2 }
      },
      decline: {
        text: "Auftrag abgelehnt. Spion respektiert Entscheidung und sendet kleinen Finderlohn für Diskretion.",
        emoji: "🤝",
        damage: 0,
        credits: 0
      }
    },
    failureResult: {
      text: "Antwort nicht eindeutig! Spion bricht Verbindung aus Sicherheitsgründen ab.",
      emoji: "📡",
      damage: 0,
      credits: 0
    },
    timeoutResult: {
      text: "ZEIT ABGELAUFEN! Übertragung bricht ab. Kurz darauf erscheinen imperiale Schiffe zum Scan.",
      emoji: "⏰",
      damage: 0,
      credits: 0
    }
  },
];

export const EXPLORATION_EVENTS: GameEvent[] = TIERED_EXPLORATION_EVENTS.map(event => ({
  emoji: event.emoji,
  text: event.text,
  damage: event.damage,
  fuel: event.fuel,
  credits: event.credits,
  addCargo: event.addCargo,
  removeCargo: event.removeCargo
}));