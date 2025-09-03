// ^^^ StarWarsly Utilities - Command Configuration Management ^^^

// >>> Manages per-channel command settings including activation status, permissions,
// >>> cooldowns, and user whitelists. Provides runtime configuration for all commands.
// >>> Ensures command behavior can be customized per channel with persistent storage.



import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { CommandConfig, ExtendedBot } from '../types/index.js';

// vvv File Path Configuration vvv
// >>> Determine storage location for command configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const COMMAND_CONFIG_FILE = path.join(__dirname, '../../storage/commandConfig.json');

// vvv Data Loading Functions vvv
// >>> Load command configuration from persistent storage
export function loadCommandConfig(): CommandConfig {
    try {
        if (fs.existsSync(COMMAND_CONFIG_FILE)) {
            const data = fs.readFileSync(COMMAND_CONFIG_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error loading command config:', e);
    }
    return {};
}

// vvv Data Persistence Functions vvv
// >>> Save command configuration to JSON file
export function saveCommandConfig(config: CommandConfig): void {
    try {
        fs.writeFileSync(COMMAND_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    } catch (e) {
        console.error('Error saving command config:', e);
    }
}

// vvv Configuration Retrieval Functions vvv
// >>> Get command settings with defaults for specific channel
export function getCommandSettings(
    bot: ExtendedBot, 
    channel: string, 
    commandName: string
) {
    const channelName = channel.startsWith('#') ? channel.slice(1) : channel;
    const command = bot.commands[commandName];
    
    // >>> Apply default values if not configured
    const defaults = {
        active: command?.defaultActive ?? true,
        modOnly: command?.defaultModOnly ?? false,
        cooldown: command?.globalCooldown ?? 0,
        whitelist: []
    };
    
    if (bot.commandConfig[channelName]?.[commandName]) {
        return {
            ...defaults,
            ...bot.commandConfig[channelName][commandName]
        };
    }
    
    return defaults;
}

// vvv Configuration Update Functions vvv
// >>> Update specific command setting for channel
export function updateCommandSetting(
    bot: ExtendedBot,
    channel: string,
    commandName: string,
    setting: 'active' | 'modOnly' | 'cooldown' | 'whitelist',
    value: boolean | number | string[]
): void {
    const channelName = channel.startsWith('#') ? channel.slice(1) : channel;
    
    // >>> Initialize channel config if needed
    if (!bot.commandConfig[channelName]) {
        bot.commandConfig[channelName] = {};
    }
    if (!bot.commandConfig[channelName][commandName]) {
        bot.commandConfig[channelName][commandName] = {
            active: true,
            modOnly: false,
            cooldown: 0,
            whitelist: []
        };
    }
    
    (bot.commandConfig[channelName][commandName] as any)[setting] = value;
    saveCommandConfig(bot.commandConfig);
}

// vvv Whitelist Management Functions vvv
// >>> Add user to command whitelist
export function addToWhitelist(
    bot: ExtendedBot,
    channel: string,
    commandName: string,
    username: string
): void {
    const channelName = channel.startsWith('#') ? channel.slice(1) : channel;
    const lowerUsername = username.toLowerCase();
    
    if (!bot.commandConfig[channelName]?.[commandName]) {
        updateCommandSetting(bot, channel, commandName, 'whitelist', [lowerUsername]);
        return;
    }
    
    const whitelist = bot.commandConfig[channelName][commandName].whitelist;
    if (!whitelist.includes(lowerUsername)) {
        const newWhitelist = [...whitelist, lowerUsername];
        updateCommandSetting(bot, channel, commandName, 'whitelist', newWhitelist);
    }
}

// >>> Remove user from command whitelist
export function removeFromWhitelist(
    bot: ExtendedBot,
    channel: string,
    commandName: string,
    username: string
): void {
    const channelName = channel.startsWith('#') ? channel.slice(1) : channel;
    const lowerUsername = username.toLowerCase();
    
    if (bot.commandConfig[channelName]?.[commandName]) {
        const whitelist = bot.commandConfig[channelName][commandName].whitelist;
        const newWhitelist = whitelist.filter(u => u !== lowerUsername);
        updateCommandSetting(bot, channel, commandName, 'whitelist', newWhitelist);
    }
}

// vvv Cooldown Management Functions vvv
// >>> Check if user is currently on cooldown for command
export function isOnCooldown(
    bot: ExtendedBot,
    channel: string,
    commandName: string,
    username: string
): boolean {
    const now = Date.now();
    const lastUsed = bot.cooldowns[channel]?.[commandName]?.[username] || 0;
    const settings = getCommandSettings(bot, channel, commandName);
    
    if (!settings.cooldown) return false;
    return now - lastUsed < settings.cooldown * 1000;
}

// >>> Set cooldown timestamp for user
export function setCooldown(
    bot: ExtendedBot,
    channel: string,
    commandName: string,
    username: string
): void {
    // >>> Initialize cooldown structure as needed
    if (!bot.cooldowns[channel]) bot.cooldowns[channel] = {};
    if (!bot.cooldowns[channel][commandName]) bot.cooldowns[channel][commandName] = {};
    
    bot.cooldowns[channel][commandName][username] = Date.now();
}