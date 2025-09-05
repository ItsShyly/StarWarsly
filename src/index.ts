// ^^^ StarWarsly Bot - Main Entry Point ^^^
// >>> 
// >>> This file initializes the Twitch bot, loads commands
// >>> and manages the core bot functionality
// >>> 
// >>> Author: SHYLY                     <<< 
// >>> Version: 1.0.0                    <<< 
// >>> May the Force be with you i guess <<< 

import { RefreshingAuthProvider } from "@twurple/auth";
import { Bot } from "@twurple/easy-bot";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

// vvv Utility Imports vvv
import { loadChannels as loadChannelsUtil } from "./utils/channels.js";
import { 
    loadCommandConfig, 
    getCommandSettings, 
    isOnCooldown, 
    setCooldown,
    updateCommandSetting,
    addToWhitelist,
    removeFromWhitelist
} from "./utils/commandConfig.js";
import { 
    loadCustomCommands, 
    getCustomCommand,
    addCustomCommand,
    editCustomCommand,
    removeCustomCommand,
    listCustomCommands,
    processVariables
} from "./utils/customCommands.js";
import { saveChannels, addChannel, removeChannel } from "./utils/channels.js";
import type { BotCommand, ExtendedBot, BotCommandContext } from "./types/index.js";

// vvv Environment Configuration vvv
// >>> Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, "..");
const ENV_PATH = path.join(PROJECT_ROOT, ".env");

// >>> Debug: Check if .env exists
console.log(`Checking .env at: ${ENV_PATH}`);
if (!fs.existsSync(ENV_PATH)) {
    console.error("❌ .env file not found at project root");
    console.log("Current directory structure:");
    console.log(fs.readdirSync(PROJECT_ROOT));
} else {
    console.log("✅ .env file found");
}

// >>> Load environment variables
const envConfig = dotenv.config({ path: ENV_PATH });
if (envConfig.error) {
    console.error("❌ Error loading .env:", envConfig.error);
}

// >>> Debug: List loaded environment variables
console.log("Loaded environment variables:");
console.log(`- TWITCH_CLIENT_ID: ${process.env.TWITCH_CLIENT_ID ? "✅" : "❌"}`);
console.log(`- BOT_NAME: ${process.env.BOT_NAME ? "✅" : "❌"}`);
console.log(`- TWITCH_CLIENT_SECRET: ${process.env.TWITCH_CLIENT_SECRET ? "✅" : "❌"}`);


// vvv Environment Management Functions vvv
// >>> Helper to update .env file
function setKey(envPath: string, key: string, value: string) {
    if (!fs.existsSync(envPath)) {
        console.warn(`.env file not found at ${envPath}`);
        return;
    }
    
    const env = fs.readFileSync(envPath, "utf-8").split("\n");
    let found = false;
    const newEnv = env.map(line => {
        if (line.startsWith(key + "=")) {
            found = true;
            return `${key}=${value}`;
        }
        return line;
    });
    if (!found) newEnv.push(`${key}=${value}`);
    fs.writeFileSync(envPath, newEnv.join("\n"));
}

// vvv Bot Configuration Variables vvv
// >>> Load environment variables for bot authentication
let clientId = process.env.TWITCH_CLIENT_ID as string;
let accessToken = process.env.TWITCH_ACCESS_TOKEN as string;
let refreshToken = process.env.TWITCH_REFRESH_TOKEN as string;
let OWN_CHANNEL = (process.env.BOT_NAME || "").toLowerCase();

if (!process.env) {
    throw new Error("Missing process.env");
}

if (!clientId) {
    throw new Error("Missing TWITCH_CLIENT_ID in .env");
}
if (!OWN_CHANNEL) {
    throw new Error("Missing BOT_NAME in .env");
}


if (!clientId || !accessToken || !OWN_CHANNEL) {
    throw new Error("Missing required environment variables");
}

// vvv Token Management System vvv
// >>> Acquire or refresh authentication tokens
async function acquireToken(): Promise<void> {
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;
    const redirectUri = process.env.TWITCH_REDIRECT_URI || "http://localhost";
    const code = process.env.CODE;

    if (!clientSecret) {
        throw new Error("TWITCH_CLIENT_SECRET is missing");
    }

    let tokenData: any;
    
    // >>> Use refresh token if available
    if (refreshToken) {
        console.log("Refreshing token using refresh token...");
        try {
            const response = await axios.post("https://id.twitch.tv/oauth2/token", null, {
                params: {
                    grant_type: "refresh_token",
                    refresh_token: refreshToken,
                    client_id: clientId,
                    client_secret: clientSecret
                }
            });
            tokenData = response.data;
        } catch (error) {
            console.error("Refresh token failed, trying authorization code...", error);
        }
    }

    // >>> Use authorization code if refresh failed or not available
    if (!tokenData && code) {
        console.log("Acquiring tokens using authorization code...");
        const response = await axios.post("https://id.twitch.tv/oauth2/token", null, {
            params: {
                grant_type: "authorization_code",
                code: code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri
            }
        });
        tokenData = response.data;
        
        // >>> Clear single-use code after successful exchange
        setKey(ENV_PATH, "CODE", "");
    }

    if (!tokenData) {
        throw new Error("No valid token acquisition method available");
    }

    // >>> Update environment values
    accessToken = tokenData.access_token;
    refreshToken = tokenData.refresh_token || refreshToken;

    // >>> Update .env file
    setKey(ENV_PATH, "TWITCH_ACCESS_TOKEN", tokenData.access_token);
    if (tokenData.refresh_token) {
        setKey(ENV_PATH, "TWITCH_REFRESH_TOKEN", tokenData.refresh_token);
    }

    // >>> Update process.env for immediate use
    process.env.TWITCH_ACCESS_TOKEN = tokenData.access_token;
    if (tokenData.refresh_token) {
        process.env.TWITCH_REFRESH_TOKEN = tokenData.refresh_token;
    }

    console.log("Token acquired successfully!");
}

// vvv Command Management System vvv
// >>> Command registry for all bot commands
const commands: Record<string, BotCommand> = {};

// vvv RECURSIVE COMMAND LOADING vvv
// >>> Load all commands from /commands folder and subdirectories
async function loadCommandFiles(): Promise<void> {
    const commandsPath = path.join(__dirname, 'commands');
    
    if (!fs.existsSync(commandsPath)) {
        throw new Error(`Commands directory not found: ${commandsPath}`);
    }
    
    // >>> Recursive function to load commands from directories
    async function loadFromDirectory(dirPath: string): Promise<void> {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            
            if (entry.isDirectory()) {
                // >>> Recursively load from subdirectories
                console.log(`📁 Scanning subdirectory: ${entry.name}`);
                await loadFromDirectory(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.js')) {
                // >>> Load command file
                try {
                    console.log(`📝 Loading command: ${fullPath}`);
                    
                    // >>> Use 'file://' prefix for Windows compatibility
                    const commandModule = await import(`file://${fullPath.replace(/\\/g, '/')}`);
                    const command = commandModule.default as BotCommand;
                    
                    if (command && command.name && command.execute && typeof command.execute === 'function') {
                        commands[command.name] = command;
                        console.log(`✅ Loaded command: ${command.name} (from ${entry.name})`);
                    } else {
                        console.log(`⚠️ Skipping non-command file: ${entry.name}`);
                    }
                } catch (error) {
                    console.error(`🔥 Error loading command ${fullPath}:`, error);
                }
            }
        }
    }
    
    console.log(`🔍 Starting recursive command loading from: ${commandsPath}`);
    await loadFromDirectory(commandsPath);
    
    console.log(`🎯 Total commands loaded: ${Object.keys(commands).length}`);
    console.log(`📋 Available commands: ${Object.keys(commands).join(', ')}`);
}

// vvv Text Processing Functions vvv
// >>> Utility function to extract command name from message
function extractCommand(text: string): string | null {
    const trimmed = text.trim();
    if (!trimmed.startsWith("#")) return null;
    
    const firstSpace = trimmed.indexOf(' ');
    const commandPart = firstSpace === -1 ? trimmed : trimmed.substring(0, firstSpace);
    return commandPart.slice(1).toLowerCase();
}

// >>> Star Wars themed response decorator
function starWarsify(text: string): string {
    const suffixes = [
        "pepePalpatine",
        "groguCoffee",
        "droid",
    ];
    return `${text} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
}

// vvv Bot Initialization System vvv
// >>> Main bot initialization with authentication and command loading
async function initBot(): Promise<ExtendedBot> {
    await loadCommandFiles();
    
    console.log("Acquiring Twitch token...");
    await acquireToken();

    console.log(`Initializing bot for channel: #${OWN_CHANNEL}`);
    
    // vvv Authentication Provider Setup vvv
    // >>> Use RefreshingAuthProvider for automatic token refresh
    const authProvider = new RefreshingAuthProvider(
        {
            clientId,
            clientSecret: process.env.TWITCH_CLIENT_SECRET!,
        }
    );
    
    // >>> Add user with chat intent for the RefreshingAuthProvider
    await authProvider.addUserForToken({
        accessToken,
        refreshToken,
        expiresIn: null,
        obtainmentTimestamp: 0
    }, ['chat']);
    
    // >>> Handle token refresh events
    authProvider.onRefresh((userId: string, newTokenData: any) => {
        console.log('Token refreshed automatically!');
        
        // >>> Update environment variables
        accessToken = newTokenData.accessToken;
        if (newTokenData.refreshToken) {
            refreshToken = newTokenData.refreshToken;
        }
        
        // >>> Update .env file
        setKey(ENV_PATH, "TWITCH_ACCESS_TOKEN", newTokenData.accessToken);
        if (newTokenData.refreshToken) {
            setKey(ENV_PATH, "TWITCH_REFRESH_TOKEN", newTokenData.refreshToken);
        }
    });
    
    authProvider.onRefreshFailure((error) => {
        console.error('Token refresh failed:', error);
        console.log('Attempting to acquire new token...');
        
        // >>> Try to acquire a new token if refresh fails
        acquireToken().then(() => {
            console.log('Successfully acquired new token after refresh failure');
        }).catch((acquireError) => {
            console.error('Failed to acquire new token:', acquireError);
            console.log('Bot may need to be restarted manually');
        });
    });

    const initialChannels = loadChannelsUtil(OWN_CHANNEL);
    console.log("Initial channels:", initialChannels);

    const baseBot = new Bot({
        authProvider,
        channels: initialChannels,
        commands: [],
    });

    const bot = baseBot as unknown as ExtendedBot;

    bot.commands = commands;
    bot.channels = initialChannels;
    bot.ownChannel = OWN_CHANNEL;
    bot.commandConfig = loadCommandConfig();
    bot.customCommands = loadCustomCommands();
    bot.cooldowns = {};
    
    // >>> Add utility functions
    bot.utils = {
        getCommandSettings,
        isOnCooldown,
        setCooldown,
        updateCommandSetting,
        addToWhitelist,
        removeFromWhitelist,
        getCustomCommand,
        addCustomCommand,
        editCustomCommand,
        removeCustomCommand,
        listCustomCommands,
        processVariables,
        loadChannels: () => loadChannelsUtil(bot.ownChannel),
        saveChannels,
        addChannel: (channel) => addChannel(channel, bot),
        removeChannel: (channel) => removeChannel(channel, bot),
        isInChannel: (channel) => bot.channels.includes(channel.toLowerCase())
    };

    // >>> Connection events
    bot.onConnect(() => {
        console.log(`1: Connected! Joined channels: ${bot.channels.join(', ')}`);
        console.log(`2: Listening for commands: ${Object.keys(commands).join(', ')}`);
        bot.say(OWN_CHANNEL, "Der Bot ist wieder online oder so..");
    });
    
    // >>> Periodic token validation (every 3 Hours)
    const tokenValidationInterval = setInterval(async () => {
        try {
            // >>> Check if we have a valid access token
            const userId = await authProvider.getAnyAccessToken();
            if (userId) {
                console.log('Token validation successful');
            }
        } catch (error) {
            console.log('Token validation failed:', error);
            // >>> RefreshingAuthProvider should handle refresh automatically
        }
    }, 3 * 60 * 60 * 1000); // <<< 3 hours

    // >>> Clear interval on shutdown
    process.on('SIGINT', () => {
        if (tokenValidationInterval) {
            clearInterval(tokenValidationInterval);
        }
    });

    // >>> Custom message handler
    bot.chat.onMessage((channel: string, user: string, text: string, msg: any) => {
        const commandName = extractCommand(text);
        if (!commandName) return;

        const params = text.trim().split(" ").slice(1);
        const command = commands[commandName];

        if (command) {
            const context: BotCommandContext = {
                channel,
                msg,
                say: (reply) => bot.say(channel, starWarsify(reply)),
                bot,
                ownChannel: OWN_CHANNEL,
                isBroadcaster: msg.userInfo.isBroadcaster,
                isMod: msg.userInfo.isMod || msg.userInfo.isBroadcaster
            };
            command.execute(params, context);
        } else {
            const customCommand = bot.utils.getCustomCommand(bot, channel, commandName);
            if (customCommand) {
                const variableContext = {
                    user: msg.userInfo.userName,
                    channel,
                    args: params,
                    msg
                };
                const response = bot.utils.processVariables(customCommand.response, variableContext);
                bot.say(channel, response);
            }
        }
    });

    // >>> Enhanced error handlers with token refresh support
    (bot.chat as any).on('error', (error: any) => {
        console.error('Chat error:', error);
        
        // >>> RefreshingAuthProvider should handle token refresh automatically
        // >>> No manual intervention needed
    });
    
    (bot.chat as any).on('connect', (addr: string, port: number) => console.log(`Connected to Twitch chat at ${addr}:${port}`));
    
    (bot.chat as any).on('disconnect', (reason: string) => {
        console.log(`Disconnected from Twitch chat: ${reason}`);
        
        // >>> RefreshingAuthProvider should handle reconnection automatically
    });
    
    (bot.chat as any).on('authenticationFailure', (message: string) => {
        console.error(`Authentication failed: ${message}`);
        console.log('RefreshingAuthProvider should handle this automatically');
        
        // >>> If automatic refresh fails, try to acquire new token as fallback
        setTimeout(() => {
            acquireToken().then(() => {
                console.log('Acquired new token as fallback, bot may need restart to reconnect');
            }).catch((acquireError) => {
                console.error('Failed to acquire new token as fallback:', acquireError);
            });
        }, 5000); // <<< Wait 5 seconds before trying fallback
    });

    // >>> Graceful shutdown
    process.on("SIGINT", () => {
        console.log("\nShutting down bot...");
        bot.quit().then(() => {
            console.log("Bot disconnected. Exiting.");
            process.exit();
        }).catch((error: Error) => {
            console.error("Error disconnecting:", error);
            process.exit(1);
        });
    });

    return bot;
}

// >>> Start the bot
initBot().catch(error => {
    console.error("Failed to initialize bot:", error);
    process.exit(1);
});
