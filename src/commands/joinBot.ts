// ^^^ StarWarsly Command - Join Bot ^^^

// >>> Allows users to have the bot join their channel.
// >>> Only works when executed in the bot's own channel.
// >>> Automatically saves the channel list after joining.

import type { BotCommandContext } from '../types/index.js';
import { addChannel } from '../utils/channels.js';

export default {
    name: "joinbot",
    description: "Join the channel of the user who summoned the bot",
    defaultActive: true,
    defaultModOnly: false,
    globalCooldown: 0,
    execute: async (params: string[], context: BotCommandContext) => {
        const { channel, msg, say, bot, ownChannel } = context;
        
        // vvv Channel Restriction vvv
        // >>> Only allow in the bot's own channel
        if (channel !== ownChannel) {
            console.log(`Command 'joinbot' ignored: only allowed in owner channel (${ownChannel})`);
            return;
        }
        
        const user = msg.userInfo.userName.toLowerCase();
        const targetChannel = user;
        
        // vvv Duplicate Check vvv
        // >>> Prevent rejoining already joined channels
        if (bot.channels.includes(targetChannel)) {
            say(`I am already in #${targetChannel}!`);
            return;
        }
        
        try {
            // vvv Channel Join Process vvv
            // >>> Join the target channel
            await bot.join(targetChannel);
            
            // >>> Persist channel list
            addChannel(targetChannel, bot);
            
            // >>> Confirm in owner channel
            say(`Successfully joined #${targetChannel}!`);
            
            // >>> Greet in new channel
            const welcomeMessage = "Hallo! Ich bin dein Star Wars Bot. Möge die Macht mit dir sein! Nutze #help für Befehle.";
            bot.say(targetChannel, welcomeMessage);
            
        } catch (error: any) {
            console.error(`Failed to join #${targetChannel}:`, error);
            say(`Failed to join #${targetChannel}: ${error.message}`);
        }
    }
};