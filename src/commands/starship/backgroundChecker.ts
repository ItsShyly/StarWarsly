// ^^^ Starship Background Checker ^^^

// >>> Monitors active flights and notifies players upon arrival at destinations.
// >>> Manages interactive event cleanup and maintains game state consistency.
// >>> Now uses the centralized GlobalDatabase system.

import { GlobalDatabase } from "../../database/GlobalDatabase.js";
import { InteractiveEventManager } from "../../utils/interactiveEvents.js";

// vvv Global Bot Reference vvv
// >>> Stored reference to bot instance for background operations
let globalBot: any = null;
let intervalStarted = false;

// >>> Singleton database instance
const globalDB = GlobalDatabase.getInstance();

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
    // >>> Fetch all currently traveling ships from centralized database
    const inFlightShips = await globalDB.getStarshipsInFlight();
    const now = Date.now();

    // vvv Flight Arrival Processing vvv
    // >>> Check each ship for arrival time
    for (const { username, inFlight } of inFlightShips) {
      if (inFlight && now >= inFlight.arrivalTime) {
        // >>> Get updated ship from centralized DB
        const fullShip = await globalDB.getStarship(username);
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
        // >>> Save updated ship state to centralized database
        await globalDB.saveStarship(username, fullShip);

        // >>> Build notification message
        const message =
          `@${username} ✅ Angekommen in ${inFlight.destination}! ` +
          `Distanz zurückgelegt: ${inFlight.distance.toFixed(
            2
          )} Lichtjahre | ` +
          `Insgesamt: ${fullShip.distance.toFixed(2)} Lichtjahre | ` +
          `Tank: ${fullShip.fuel}% pepePalpatine`;

        // vvv Chat Notification vvv
        // >>> Send notification using globalBot if available
        if (globalBot) {
          console.log(
            `Sending arrival notification to ${username} in ${inFlight.channel}`
          );
          globalBot.say(inFlight.channel, message);
        }
      }
    }
  } catch (error) {
    console.error("Background flight check error:", error);
  }
}
