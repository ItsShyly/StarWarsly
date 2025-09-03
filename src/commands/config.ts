// ^^^ StarWarsly Command - Configuration Management ^^^

// >>> This command allows channel moderators to configure command settings
// >>> including activation status, permission restrictions, cooldowns, and user whitelists.
// >>> Provides comprehensive control over bot behavior per channel.

import { BotCommandContext } from '../types/index.js';
import { 
    getCommandSettings, 
    updateCommandSetting, 
    addToWhitelist, 
    removeFromWhitelist 
} from '../utils/commandConfig.js';

export default {
    name: "config",
    description: "Configure command settings",
    defaultModOnly: true,
    globalCooldown: 5,
    execute: async (params: string[], context: BotCommandContext) => {
        const { channel, msg, say, bot, ownChannel, isBroadcaster, isMod } = context;
        const user = msg.userInfo.userName;
        const isOwner = channel === `#${ownChannel}`;
        
        if (params.length < 2) {
            say(`Usage: #config <command> <setting> [value]. Settings: active, modOnly, cooldown, whitelist`);
            return;
        }
        
        const [commandName, setting, ...valueParts] = params;
        const value = valueParts.join(' ');
        const command = bot.commands[commandName];
        
        if (!command) {
            say(`Command not found: ${commandName}`);
            return;
        }
        
        // vvv Authorization Check vvv
        // >>> Verify user has permission to modify settings
        if (!isOwner && !isBroadcaster && !isMod) {
            say(`Only channel moderators can configure commands`);
            return;
        }
        
        // vvv Setting Modification Handlers vvv
        // >>> Handle different setting types
        switch (setting.toLowerCase()) {
            case 'active':
                if (value === 'on' || value === 'true') {
                    updateCommandSetting(bot, channel, commandName, 'active', true);
                    say(`Enabled ${commandName} command`);
                } else if (value === 'off' || value === 'false') {
                    updateCommandSetting(bot, channel, commandName, 'active', false);
                    say(`Disabled ${commandName} command`);
                } else {
                    const settings = getCommandSettings(bot, channel, commandName);
                    say(`${commandName} is currently ${settings.active ? 'ENABLED' : 'DISABLED'}`);
                }
                break;
                
            case 'modonly':
                if (value === 'on' || value === 'true') {
                    updateCommandSetting(bot, channel, commandName, 'modOnly', true);
                    say(`Restricted ${commandName} to mods only`);
                } else if (value === 'off' || value === 'false') {
                    updateCommandSetting(bot, channel, commandName, 'modOnly', false);
                    say(`Opened ${commandName} to all users`);
                } else {
                    const settings = getCommandSettings(bot, channel, commandName);
                    say(`${commandName} is ${settings.modOnly ? 'RESTRICTED to mods' : 'OPEN to all users'}`);
                }
                break;
                
            case 'cooldown':
                const cooldown = parseInt(value);
                if (!isNaN(cooldown) && cooldown >= 0) {
                    updateCommandSetting(bot, channel, commandName, 'cooldown', cooldown);
                    say(`Set ${commandName} cooldown to ${cooldown} seconds`);
                } else {
                    const settings = getCommandSettings(bot, channel, commandName);
                    say(`${commandName} cooldown is ${settings.cooldown} seconds`);
                }
                break;
                
            case 'whitelist':
                if (value.toLowerCase() === 'add' && params[3]) {
                    const username = params[3];
                    addToWhitelist(bot, channel, commandName, username);
                    say(`Added ${username} to ${commandName} whitelist`);
                } else if (value.toLowerCase() === 'remove' && params[3]) {
                    const username = params[3];
                    removeFromWhitelist(bot, channel, commandName, username);
                    say(`Removed ${username} from ${commandName} whitelist`);
                } else {
                    const settings = getCommandSettings(bot, channel, commandName);
                    if (settings.whitelist.length > 0) {
                        say(`${commandName} whitelist: ${settings.whitelist.join(', ')}`);
                    } else {
                        say(`${commandName} has no users in whitelist`);
                    }
                }
                break;
                
            case 'status':
                const settings = getCommandSettings(bot, channel, commandName);
                say(`${commandName} status: 
                    Active: ${settings.active ? 'Yes' : 'No'}
                    Mod Only: ${settings.modOnly ? 'Yes' : 'No'}
                    Cooldown: ${settings.cooldown} seconds
                    Whitelist: ${settings.whitelist.length} users`);
                break;
                
            default:
                say(`Invalid setting. Use: active, modOnly, cooldown, whitelist, status`);
        }
    }
};