// ^^^ StarWarsly Command - Add Custom Command ^^^

// >>> Allows moderators and broadcasters to create custom text commands.
// >>> Custom commands support variables and can be edited after creation.
// >>> Each command is unique per channel with response customization.

import type { BotCommandContext } from '../types/index.js';

export default {
    name: "addcommand",
    description: "Add a custom command",
    defaultModOnly: true,
    globalCooldown: 5,
    execute: async (params: string[], context: BotCommandContext) => {
        const { channel, msg, say, bot, isBroadcaster, isMod } = context;
        const user = msg.userInfo.userName;
        
        // vvv Parameter Validation vvv
        // >>> Ensure proper command syntax
        if (params.length < 2) {
            say("Usage: #addcommand <name> <response>");
            return;
        }
        
        const commandName = params[0].toLowerCase();
        const response = params.slice(1).join(" ");
        
        // vvv Authorization Check vvv
        // >>> Verify user has permission to create commands
        if (!isBroadcaster && !isMod) {
            say("Only moderators can create commands");
            return;
        }
        
        // vvv Duplicate Prevention vvv
        // >>> Check for existing command conflicts
        if (bot.commands[commandName] || bot.utils.getCustomCommand(bot, channel, commandName)) {
            say(`Command ${commandName} already exists!`);
            return;
        }
        
        // vvv Command Creation vvv
        // >>> Add new custom command to channel
        bot.utils.addCustomCommand(bot, channel, commandName, response, user);
        say(`Command #${commandName} created!`);
    }
};