// ^^^ Leaderboard Display Commands ^^^
// vvv Leaderboard Retrieval and Formatting vvv

import type { StarshipDatabase } from "./StarshipDatabase.js";

export class LeaderboardCommands {
  // >>> Display top players ranked by distance traveled
  static async showLeaderboard(
    starshipDB: StarshipDatabase,
    reply: (message: string) => void
  ): Promise<void> {
    try {
      const leaderboard = await starshipDB.getLeaderboard(10); // <<< Get top 10 players
      
      if (leaderboard.length === 0) {
        reply("🏆 Noch keine Spieler auf der Bestenliste! Sei der erste und starte dein Weltraumabenteuer!");
        return;
      }

      let message = "#starship BESTENLISTE: ";

      leaderboard.forEach((player, index) => {
        const position = index + 1;
        const emoji = position === 1 ? "🥇" : position === 2 ? "🥈" : position === 3 ? "🥉" : "⭐";
        const distanceFormatted = player.distance.toLocaleString('de-DE', { 
          maximumFractionDigits: 2  // <<< German number formatting
        });
        
        message += `${emoji}  ${position}. ${player.name}\n`;
        message += ` ➔ ${distanceFormatted} Lichtjahre\n`;
      });

      
      reply(message);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      reply("❌ Fehler beim Laden der Bestenliste. Versuche es später erneut.");
    }
  }
}