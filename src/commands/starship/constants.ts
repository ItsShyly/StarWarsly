// ^^^ Starship Constants - Game Configuration ^^^

// >>> Contains all game constants including cargo types, events, and exploration scenarios.
// >>> Defines economic values, probabilities, and gameplay mechanics.
// >>> Central configuration for the entire starship adventure system.

import type { CargoType, GameEvent, TieredExplorationEvent, InteractiveEvent } from "./types.js";

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

// vvv Interactive Events vvv
// >>> Time-limited events requiring player response
export const INTERACTIVE_EVENTS: InteractiveEvent[] = [
  {
    id: "sandstorm_escape",
    emoji: "🌪️",
    text: "Ein gewaltiger Sandsturm nähert sich! Du siehst eine Höhle in der Ferne. Schreibe schnell `#shelter` um dich zu verstecken! (Du hast T-minus 20 Standardsekunden und 0,9234 Millisekunden.",
    timeLimit: 20, // <<< seconds
    successCommand: "shelter",
    successResult: {
      text: "Du erreichst die Höhle rechtzeitig und wartest den Sturm ab. Kein Schaden!",
      emoji: "🏠",
      damage: 0,
      credits: 0
    },
    failureResult: {
      text: "Der Sandsturm erwischt dich! Sand dringt in alle Systeme ein.",
      emoji: "💥",
      damage: 15,
      credits: -80
    }
  },
  {
    id: "bounty_hunter_trap",
    emoji: "🎯",
    text: "Du wurdest in eine Falle gelockt, aber erkennst es noch schnell genug! Schreibe schnell `#run` in den Chat, du hast 15 Sekunden Zeit bevor dir deine Credits gestohlen werden!",
    timeLimit: 15,
    successCommand: "run",
    successResult: {
      text: "Du springst in dein Schiff und entkommst den Kopfgeldjägern knapp!",
      emoji: "🚀",
      damage: 0,
      credits: 0
    },
    failureResult: {
      text: "Die Kopfgeldjäger haben dich erwischt und rauben dich aus!",
      emoji: "💸",
      damage: 5,
      credits: -200
    }
  },
  {
    id: "imperial_patrol",
    emoji: "⚔️",
    text: "Imperiale Sturmtruppen nähern sich! Du kannst dich verstecken oder bestehen. Schreibe `#hide` oder `#bribe` - 12 Sekunden bis sie dich entdecken!",
    timeLimit: 12,
    successCommand: ["hide", "bribe"],
    successResult: {
      hide: {
        text: "Du versteckst dich geschickt zwischen den Felsen. Die Patrouille zieht vorbei.",
        emoji: "👤",
        damage: 0,
        credits: 0
      },
      bribe: {
        text: "Ein kleines Bestechungsgeld und die Sturmtruppen schauen weg.",
        emoji: "💰",
        damage: 0,
        credits: -50
      }
    },
    failureResult: {
      text: "Die Imperialen haben dich entdeckt! Ein kurzer Feuerkampf beschädigt dein Schiff.",
      emoji: "💥",
      damage: 20,
      credits: -100
    }
  },
  {
    id: "cantina_fight",
    emoji: "🍺",
    text: "In der örtlichen Cantina provoziert dich ein Alien! Schreibe `#fight` um zu kämpfen oder `#peace` um zu verhandeln. 30 Sekunden bis die Situation eskaliert!",
    timeLimit: 30,
    successCommand: ["fight", "peace"],
    successResult: {
      fight: {
        text: "Du gewinnst den Faustkampf! Die anderen Gäste sind beeindruckt und spendieren dir Drinks.",
        emoji: "👊",
        damage: 5,
        credits: 75
      },
      peace: {
        text: "Deine Diplomatie zahlt sich aus. Der Alien entschuldigt sich und kauft dir einen Drink.",
        emoji: "🤝",
        damage: 0,
        credits: 25
      }
    },
    failureResult: {
      text: "Die ganze Cantina bricht in eine Schlägerei aus! Du flüchtest mit Schrammen und leeren Taschen.",
      emoji: "💔",
      damage: 12,
      credits: -120
    }
  },
  {
    id: "jawa_traders",
    emoji: "👥",
    text: "Jawas bieten dir Ersatzteile an, aber sie sprechen schnell und gestikulieren wild! Schreibe `#buy` um zu kaufen oder `#inspect` um die Teile zu prüfen. 45 Sekunden!",
    timeLimit: 45,
    successCommand: ["buy", "inspect"],
    successResult: {
      buy: {
        text: "Du kaufst impulsiv - es sind tatsächlich qualitativ gute Teile! Dein Schiff ist etwas repariert.",
        emoji: "🛠️",
        damage: -10,
        credits: -60
      },
      inspect: {
        text: "Deine Vorsicht zahlt sich aus - du findest defekte Teile und verhandelst den Preis runter!",
        emoji: "🔍",
        damage: -5,
        credits: -30
      }
    },
    failureResult: {
      text: "Du zögerst zu lange und die Jawas denken, du willst sie betrügen! Sie fahren weg und andere Jawas meiden dich.",
      emoji: "😤",
      damage: 0,
      credits: 0
    }
  },
  {
    id: "krayt_dragon_den",
    emoji: "🐉",
    text: "Du stößt auf eine Krayt-Drachen-Höhle mit wertvollen Perlen! Aber das Biest bewegt sich. Schreibe `#sneak` um zu schleichen oder `#retreat` um zu fliehen! 20 Sekunden!",
    timeLimit: 20,
    successCommand: ["sneak", "retreat"],
    successResult: {
      sneak: {
        text: "Du schleichst erfolgreich vorbei und sammelst einige Krayt-Drachen-Perlen!",
        emoji: "💎",
        damage: 0,
        credits: 180,
        addCargo: { item: "Antike Artefakte", quantity: 1 }
      },
      retreat: {
        text: "Du ziehst dich vorsichtig zurück. Besser so - der Drache war wach!",
        emoji: "🚶",
        damage: 0,
        credits: 0
      }
    },
    failureResult: {
      text: "Der Krayt-Drache bemerkt dich! Du fliehst hastig, aber dein Schiff wird beim Start beschädigt.",
      emoji: "🐲",
      damage: 25,
      credits: -50
    }
  },
  {
    id: "space_pirate_ambush",
    emoji: "🏴‍☠️",
    text: "Weltraumpiraten greifen an! Deine Schilde sind schwach. Schreibe `#shields` um Energie umzuleiten oder `#weapons` um zurückzuschießen! 30 Sekunden!",
    timeLimit: 30,
    successCommand: ["shields", "weapons"],
    successResult: {
      shields: {
        text: "Deine verstärkten Schilde halten stand! Die Piraten geben auf und fliehen.",
        emoji: "🛡️",
        damage: 5,
        credits: 0
      },
      weapons: {
        text: "Dein Gegenangriff trifft! Die Piraten explodieren und hinterlassen Wrackteile.",
        emoji: "💥",
        damage: 8,
        credits: 90,
        addCargo: { item: "Raumschiff-Bauteile", quantity: 1 }
      }
    },
    failureResult: {
      text: "Die Piraten durchbrechen deine Verteidigung! Sie beschädigen dein Schiff und stehlen Credits.",
      emoji: "☠️",
      damage: 30,
      credits: -150
    }
  },
  {
    id: "toxic_gas_leak",
    emoji: "☠️",
    text: "Giftgas strömt aus einer beschädigten Anlage! Schreibe `#mask` um deine Atemmaske aufzusetzen oder `#run` um zu rennen! 60 Sekunden!",
    timeLimit: 60,
    successCommand: ["mask", "run"],
    successResult: {
      mask: {
        text: "Deine Atemmaske rettet dich! Du kannst sogar wertvolle Chemikalien aus der Anlage bergen.",
        emoji: "😷",
        damage: 0,
        credits: 120,
        addCargo: { item: "Medizinische Vorräte", quantity: 1 }
      },
      run: {
        text: "Du rennst schnell genug weg! Nur ein wenig benommen, aber unverletzt.",
        emoji: "🏃",
        damage: 3,
        credits: 0
      }
    },
    failureResult: {
      text: "Das Giftgas erwischt dich! Du erleidest Vergiftungssymptome und musst teure Medizin kaufen.",
      emoji: "🤢",
      damage: 15,
      credits: -100
    }
  },
  {
    id: "rebel_spy_contact",
    emoji: "🕵️",
    text: "Ein Rebellenspion kontaktiert dich per Funk! Er bietet dir einen riskanten Auftrag. Schreibe `#accept` oder `#decline` - T-50 Standardsekunden bis die Verbindung abbricht!",
    timeLimit: 50,
    successCommand: ["accept", "decline"],
    successResult: {
      accept: {
        text: "Du nimmst den Auftrag an! Der Spion überweist dir Credits und gibt dir verschlüsselte Daten.",
        emoji: "📊",
        damage: 0,
        credits: 200,
        addCargo: { item: "Rebellische Propaganda", quantity: 2 }
      },
      decline: {
        text: "Du lehnst höflich ab. Der Spion respektiert deine Entscheidung und gibt dir einen kleinen Tipp.",
        emoji: "🤝",
        damage: 0,
        credits: 50
      }
    },
    failureResult: {
      text: "Die Übertragung wird von Imperialen abgefangen! Du wirst als Rebellensympathisant markiert.",
      emoji: "📡",
      damage: 0,
      credits: -80
    }
  },
  {
    id: "rancor_pit_fall",
    emoji: "🕳️",
    text: "Du fällst in eine Rancor-Grube! Das Monster schläft noch. Schreibe `#climb` um herauszuklettern oder `#hide` um dich zu verstecken! 30 Sekunden bis es aufwacht!",
    timeLimit: 30,
    successCommand: ["climb", "hide"],
    successResult: {
      climb: {
        text: "Du kletterst geschickt heraus! Dabei findest du sogar einige Knochen mit wertvollen Gegenständen.",
        emoji: "🧗",
        damage: 5,
        credits: 70
      },
      hide: {
        text: "Du versteckst dich erfolgreich! Als der Rancor weggeht, findest du einen geheimen Tunnel.",
        emoji: "🫥",
        damage: 0,
        credits: 40
      }
    },
    failureResult: {
      text: "Der Rancor wacht auf! Du entkommst knapp, aber nicht ohne Verletzungen und verlorene Ausrüstung.",
      emoji: "👹",
      damage: 20,
      credits: -60,
      removeCargo: true
    }
  }
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
