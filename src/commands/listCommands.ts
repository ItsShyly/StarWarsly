// ^^^ StarWarsly Command - List Custom Commands ^^^

// >>> Displays all custom commands created for the current channel.
// >>> Helps users discover available custom commands.

import type { BotCommandContext } from '../types/index.js';

export default {
    name: "listcommands",
    description: "List all custom commands",
    defaultModOnly: false,
    globalCooldown: 10,
    execute: async (params: string[], context: BotCommandContext) => {
        const { channel, say, bot } = context;
        
        const customCommands = bot.utils.listCustomCommands(bot, channel);
        
        if (customCommands.length === 0) {
            say("No custom commands have been created yet!");
            return;
        }
        
        say(`Custom commands: ${customCommands.map((cmd: string) => `#${cmd}`).join(", ")}`);
    }
};