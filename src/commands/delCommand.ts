// ^^^ StarWarsly Command - Delete Custom Command ^^^

// >>> Allows moderators and broadcasters to remove custom text commands.
// >>> Permanently deletes the command from the channel's custom command list.

import type { BotCommandContext } from '../types/index.js';

export default {
    name: "delcommand",
    description: "Delete a custom command",
    defaultModOnly: true,
    globalCooldown: 5,
    execute: async (params: string[], context: BotCommandContext) => {
        const { channel, msg, say, bot, isBroadcaster, isMod } = context;
        
        if (params.length < 1) {
            say("Usage: #delcommand <name>");
            return;
        }
        
        const commandName = params[0].toLowerCase();
        
        // vvv Authorization Check vvv
        // >>> Verify user has permission
        if (!isBroadcaster && !isMod) {
            say("Only moderators can delete commands");
            return;
        }
        
        // vvv Command Existence Check vvv
        // >>> Ensure command exists before deletion
        if (!bot.utils.getCustomCommand(bot, channel, commandName)) {
            say(`Command ${commandName} doesn't exist!`);
            return;
        }
        
        bot.utils.removeCustomCommand(bot, channel, commandName);
        say(`Command #${commandName} deleted!`);
    }
};