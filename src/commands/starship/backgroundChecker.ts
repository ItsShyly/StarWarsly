// ^^^ Starship Background Checker - Automated Flight Management ^^^

// >>> Monitors active flights and notifies players upon arrival at destinations.
// >>> Manages interactive event cleanup and maintains game state consistency.
// >>> Runs periodic checks to ensure timely flight completion notifications.

import { StarshipDatabase } from "./StarshipDatabase.js";
import { InteractiveEventManager } from "./interactiveEvents.js";

// vvv Global Bot Reference vvv
// >>> Stored reference to bot instance for background operations
let globalBot: any = null;
let intervalStarted = false;

// ^^^ Background Service Initialization ^^^
export function initializeBackgroundChecker(bot: any) {
  // vvv Bot Instance Management vvv
  // >>> Store bot reference for global access
  if (!globalBot) {
    globalBot = bot;
  }
  
  // vvv Interval Timer Setup vvv
  // >>> Start periodic checkers only once
  if (!intervalStarted) {
    intervalStarted = true;
    setInterval(backgroundFlightChecker, 60000); // <<< Check flights every minute
    // >>> Clean up expired interactive events every 30 seconds
    setInterval(() => {
      InteractiveEventManager.cleanupExpiredEvents();
    }, 30000); // <<< 30 second cleanup cycle
  }
}

// ^^^ Automated Flight Completion Checker ^^^
async function backgroundFlightChecker() {
  try {
    // vvv Event Maintenance vvv
    // >>> Clean up expired interactive events
    InteractiveEventManager.cleanupExpiredEvents();
    
    // vvv Database Query vvv
    // >>> Fetch all currently traveling ships
    const starshipDB = new StarshipDatabase();
    const inFlightShips = await starshipDB.getAllInFlight();
    const now = Date.now();

    // vvv Flight Arrival Processing vvv
    // >>> Check each ship for arrival time
    for (const { user, inFlight } of inFlightShips) {
      if (inFlight && now >= inFlight.arrivalTime) {
        // >>> Get updated ship from DB
        const fullShip = await starshipDB.get(user);
        if (!fullShip) continue;

        // vvv Arrival State Update vvv
        // >>> Process arrival and reset exploration state
        fullShip.location = inFlight.destination;
        fullShip.distance += inFlight.distance;
        fullShip.canLand = true;
        fullShip.exploreCount = 0;
        fullShip.hasLanded = false; // <<< Reset landing status for new planet
        delete fullShip.inFlight;

        // vvv Persistence & Notification vvv
        // >>> Save updated ship state
        await starshipDB.save(user, fullShip);

        // >>> Build notification message
        const message =
          `@${user} ✅ Angekommen in ${inFlight.destination}! ` +
          `Distanz zurückgelegt: ${inFlight.distance.toFixed(
            2
          )} Lichtjahre | ` +
          `Insgesamt: ${fullShip.distance.toFixed(2)} Lichtjahre | ` +
          `Tank: ${fullShip.fuel}% pepePalpatine`;

        // vvv Chat Notification vvv
        // >>> Send notification using globalBot if available
        if (globalBot) {
          console.log(
            `Sending arrival notification to ${user} in ${inFlight.channel}`
          );
          globalBot.say(inFlight.channel, message);
        }
      }
    }
    // vvv Database Cleanup vvv
    // >>> Close connection to prevent memory leaks
    starshipDB.close();
  } catch (error) {
    console.error("Background flight check error:", error);
  }
}
