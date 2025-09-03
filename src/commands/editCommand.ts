// ^^^ StarWarsly Command - Edit Custom Command ^^^

// >>> Allows moderators and broadcasters to modify existing custom commands.
// >>> Updates the response text while preserving the command name.

import type { BotCommandContext } from '../types/index.js';

export default {
    name: "editcommand",
    description: "Edit a custom command",
    defaultModOnly: true,
    globalCooldown: 5,
    execute: async (params: string[], context: BotCommandContext) => {
        const { channel, msg, say, bot, isBroadcaster, isMod } = context;
        const user = msg.userInfo.userName;
        
        if (params.length < 2) {
            say("Usage: #editcommand <name> <new response>");
            return;
        }
        
        const commandName = params[0].toLowerCase();
        const newResponse = params.slice(1).join(" ");
        
        // vvv Authorization Check vvv
        // >>> Verify user has permission
        if (!isBroadcaster && !isMod) {
            say("Only moderators can edit commands");
            return;
        }
        
        // vvv Command Existence Check vvv
        // >>> Ensure command exists before editing
        if (!bot.utils.getCustomCommand(bot, channel, commandName)) {
            say(`Command ${commandName} doesn't exist!`);
            return;
        }
        
        bot.utils.editCustomCommand(bot, channel, commandName, newResponse, user);
        say(`Command #${commandName} updated!`);
    }
};