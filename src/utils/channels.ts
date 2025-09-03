// ^^^ StarWarsly Utilities - Channel Management ^^^

// >>> Manages the list of Twitch channels where the bot operates.
// >>> Handles joining and leaving channels with persistent storage.
// >>> Maintains synchronization between bot state and configuration files.



import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ExtendedBot } from '../types/index.js';
import { saveCommandConfig } from './commandConfig.js';

// vvv File Path Configuration vvv
// >>> Determine storage location for channel list
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CHANNELS_FILE = path.join(__dirname, '../../storage/channels.json');

// vvv Data Loading Functions vvv
// >>> Load channel list from persistent storage
export function loadChannels(ownChannel: string): string[] {
    try {
        if (fs.existsSync(CHANNELS_FILE)) {
            const data = fs.readFileSync(CHANNELS_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error loading channels:', e);
    }
    return [ownChannel];
}

// vvv Data Persistence Functions vvv
// >>> Save channel list to JSON file
export function saveChannels(channels: string[]): void {
    try {
        fs.writeFileSync(CHANNELS_FILE, JSON.stringify(channels), 'utf-8');
    } catch (e) {
        console.error('Error saving channels:', e);
    }
}

// vvv Channel Management Functions vvv
// >>> Add new channel to bot's active list
export function addChannel(channel: string, bot: ExtendedBot): void {
    const lowerChannel = channel.toLowerCase();
    if (!bot.channels.includes(lowerChannel)) {
        bot.channels.push(lowerChannel);
        saveChannels(bot.channels);
        
        // >>> Initialize command config for new channel
        if (!bot.commandConfig[lowerChannel]) {
            bot.commandConfig[lowerChannel] = {};
            saveCommandConfig(bot.commandConfig);
        }
    }
}

// >>> Remove channel from bot's active list
export function removeChannel(channel: string, bot: ExtendedBot): void {
    const lowerChannel = channel.toLowerCase();
    if (bot.channels.includes(lowerChannel)) {
        bot.channels = bot.channels.filter(c => c !== lowerChannel);
        saveChannels(bot.channels);
    }
}