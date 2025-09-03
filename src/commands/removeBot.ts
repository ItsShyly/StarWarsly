// ^^^ StarWarsly Command - Remove Bot ^^^

// >>> Allows the bot owner to remove the bot from channels.

import type { BotCommandContext } from '../types/index.js';
import { removeChannel } from '../utils/channels.js';

export default {
    name: "removebot",
    description: "Make the bot leave a channel",
    defaultActive: true,
    defaultModOnly: false,
    globalCooldown: 0,
    execute: async (params: string[], context: BotCommandContext) => {
        const { channel, msg, say, bot, ownChannel } = context;
        
        // vvv Channel Restriction vvv
        // >>> Only allow in the bot's own channel
        if (channel !== ownChannel) {
            console.log(`Command 'removebot' ignored: only allowed in owner channel (${ownChannel})`);
            return;
        }
        
        const user = msg.userInfo.userName.toLowerCase();
        const targetChannel = params[0]?.toLowerCase() || user;
        
        // vvv Self-Protection Check vvv
        // >>> Cannot leave own channel
        if (targetChannel === ownChannel) {
            say("I cannot leave my own channel!");
            return;
        }
        
        // vvv Membership Check vvv
        // >>> Verify bot is in the channel
        if (!bot.channels.includes(targetChannel)) {
            say(`I'm not in #${targetChannel}!`);
            return;
        }
        
        try {
            // vvv Channel Leave Process vvv
            // >>> Leave the target channel
            await bot.leave(targetChannel);
            
            // >>> Persist channel list
            removeChannel(targetChannel, bot);
            
            say(`Successfully left #${targetChannel}!`);
        } catch (error: any) {
            console.error(`Failed to leave #${targetChannel}:`, error);
            say(`Failed to leave #${targetChannel}: ${error.message}`);
        }
    }
};