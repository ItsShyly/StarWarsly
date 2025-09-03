// ^^^ StarWarsly Command - Help System ^^^

// >>> This command provides users with a list of all available commands in their channel.

import type { BotCommandContext } from '../types/index.js';

export default {
    name: "help",
    description: "List all available commands",
    defaultActive: true,
    defaultModOnly: false,
    globalCooldown: 10,
    execute: async (params: string[], context: BotCommandContext) => {
        const { channel, msg, say, bot, isBroadcaster, isMod } = context;
        const user = msg.userInfo.userName;
        
        // vvv Command Activation Check vvv
        // >>> Check if command is active in this channel
        const settings = bot.utils.getCommandSettings(bot, channel, 'help');
        if (!settings.active) {
            console.log(`Command 'help' is disabled in ${channel}`);
            return;
        }
        
        // vvv User Authorization Check vvv
        // >>> Verify user has permission to use this command
        if (settings.modOnly && !isMod && !isBroadcaster && 
            !settings.whitelist.includes(user.toLowerCase())) {
            console.log(`User ${user} not authorized for 'help' in ${channel}`);
            return;
        }
        
        // vvv Cooldown Management vvv
        // >>> Prevent command spam
        if (bot.utils.isOnCooldown(bot, channel, 'help', user)) {
            console.log(`User ${user} on cooldown for 'help' in ${channel}`);
            return;
        }
        
        // vvv Command Collection vvv
        // >>> Get built-in commands that are active
        const builtInCommands = Object.values(bot.commands)
            .filter((cmd: any) => bot.utils.getCommandSettings(bot, channel, cmd.name).active)
            .map((cmd: any) => `#${cmd.name}`);
        
        // >>> Get custom commands
        const customCommands = bot.utils.listCustomCommands(bot, channel);
        
        // >>> Combine both
        const allCommands = [...builtInCommands, ...customCommands.map((cmd: string) => `#${cmd}`)];
        
        if (allCommands.length === 0) {
            say("No commands available!");
            return;
        }
        
        say(`Available commands: ${allCommands.join(", ")}`);
        
        // >>> Set cooldown
        bot.utils.setCooldown(bot, channel, 'help', user);
    }
};