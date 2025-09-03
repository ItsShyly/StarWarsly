// ^^^ StarWarsly Utilities - Custom Command Management ^^^

// >>> Manages custom commands for different channels, allowing broadcasters and mods
// >>> to create, edit, and remove personalized commands with variable support.
// >>> Provides persistence through JSON file storage and dynamic variable processing.



import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { CustomCommands, ExtendedBot } from '../types/index.js';

// vvv File Path Configuration vvv
// >>> Determine JSON storage location
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CUSTOM_COMMANDS_FILE = path.join(__dirname, '../../storage/customCommands.json');

// vvv Data Loading Functions vvv
// >>> Load custom commands from persistent storage
export function loadCustomCommands(): CustomCommands {
    try {
        if (fs.existsSync(CUSTOM_COMMANDS_FILE)) {
            const data = fs.readFileSync(CUSTOM_COMMANDS_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error loading custom commands:', e);
    }
    return {};
}

// vvv Data Persistence Functions vvv
// >>> Save custom commands to JSON file
export function saveCustomCommands(commands: CustomCommands): void {
    try {
        fs.writeFileSync(CUSTOM_COMMANDS_FILE, JSON.stringify(commands, null, 2), 'utf-8');
    } catch (e) {
        console.error('Error saving custom commands:', e);
    }
}

// vvv Command Management Functions vvv
// >>> Add new custom command to channel
export function addCustomCommand(
    bot: ExtendedBot,
    channel: string,
    commandName: string,
    response: string,
    creator: string
): void {
    const channelName = channel.startsWith('#') ? channel.slice(1) : channel;
    
    if (!bot.customCommands[channelName]) {
        bot.customCommands[channelName] = {};
    }
    
    bot.customCommands[channelName][commandName] = {
        response,
        createdBy: creator,
        createdAt: Date.now()
    };
    
    saveCustomCommands(bot.customCommands);
}

// >>> Modify existing custom command response
export function editCustomCommand(
    bot: ExtendedBot,
    channel: string,
    commandName: string,
    newResponse: string,
    editor: string
): void {
    const channelName = channel.startsWith('#') ? channel.slice(1) : channel;
    
    if (bot.customCommands[channelName]?.[commandName]) {
        bot.customCommands[channelName][commandName] = {
            ...bot.customCommands[channelName][commandName],
            response: newResponse,
            lastEdited: Date.now()
        };
        saveCustomCommands(bot.customCommands);
    }
}

// >>> Delete custom command from channel
export function removeCustomCommand(
    bot: ExtendedBot,
    channel: string,
    commandName: string
): void {
    const channelName = channel.startsWith('#') ? channel.slice(1) : channel;
    
    if (bot.customCommands[channelName]?.[commandName]) {
        delete bot.customCommands[channelName][commandName];
        saveCustomCommands(bot.customCommands);
    }
}

// vvv Command Retrieval Functions vvv
// >>> Retrieve specific custom command
export function getCustomCommand(
    bot: ExtendedBot,
    channel: string,
    commandName: string
) {
    const channelName = channel.startsWith('#') ? channel.slice(1) : channel;
    return bot.customCommands[channelName]?.[commandName] || null;
}

// >>> Get all custom command names for channel
export function listCustomCommands(bot: ExtendedBot, channel: string): string[] {
    const channelName = channel.startsWith('#') ? channel.slice(1) : channel;
    return bot.customCommands[channelName] 
        ? Object.keys(bot.customCommands[channelName]) 
        : [];
}

// vvv Variable Processing System vvv
// >>> Replace dynamic variables in command responses
export function processVariables(
    response: string,
    context: {
        user: string;
        channel: string;
        args: string[];
        msg: any;
    }
): string {
    const { user, channel, args, msg } = context;
    const channelName = channel.startsWith('#') ? channel.slice(1) : channel;
    
    let processed = response
        .replace(/\$\(user\)/gi, user)
        .replace(/\$\(channel\)/gi, channelName)
        .replace(/\$\(self\)/gi, msg.userInfo.userName)
        .replace(/\$\(target\)/gi, args[0] || '')
        .replace(/\$\(random\)/gi, Math.floor(Math.random() * 100).toString());
    
    args.forEach((arg, index) => {
        processed = processed.replace(new RegExp(`\\$\\(arg${index + 1}\\)`, 'gi'), arg);
    });
    
    processed = processed.replace(/\{([^}]+)\}/g, match => {
        const options = match.slice(1, -1).split('|');
        return options[Math.floor(Math.random() * options.length)];
    });
    
    const counterMatch = processed.match(/\$\(counter\)/gi);
    if (counterMatch) {
        const count = counterMatch.length;
        processed = processed.replace(/\$\(counter\)/gi, count.toString());
    }
    
    return processed;
}