// ^^^ StarWarsly Types - Core Bot Definitions ^^^

// >>> Defines all TypeScript types and interfaces used throughout the StarWarsly bot.
// >>> Includes bot configuration, command structures, user context, and extended bot functionality.
// >>> Ensures type safety and clear contracts between different parts of the system.

import { Bot } from "@twurple/easy-bot";
import type { AuthProvider } from "@twurple/auth";

// vvv Configuration Types vvv
export type CommandConfig = {
  [channel: string]: {
    [command: string]: {
      active: boolean;
      modOnly: boolean;
      cooldown: number;
      whitelist: string[];
    };
  };
};

// vvv Custom Command System vvv
export type CustomCommand = {
  response: string;
  createdBy: string;
  createdAt: number;
  lastEdited?: number;
};

export type CustomCommands = {
  [channel: string]: {
    [commandName: string]: CustomCommand;
  };
};

// vvv Bot Command Interface vvv
export type BotCommand = {
  name: string;
  description: string;
  globalCooldown?: number;
  defaultActive?: boolean;
  defaultModOnly?: boolean;
  execute: (params: string[], context: BotCommandContext) => Promise<void>;
};

// vvv Command Execution Context vvv
export type BotCommandContext = {
  channel: string;
  msg: any;
  say: (message: string) => void;
  bot: ExtendedBot;
  ownChannel: string;
  isBroadcaster: boolean;
  isMod: boolean;
};

// vvv Extended Bot Interface vvv
export type ExtendedBot = Bot & {
  commands: Record<string, BotCommand>;
  channels: string[];
  ownChannel: string;
  commandConfig: CommandConfig;
  customCommands: CustomCommands;
  cooldowns: {
    [channel: string]: {
      [command: string]: {
        [user: string]: number;
      };
    };
  };
  utils: {
    getCommandSettings: (bot: ExtendedBot, channel: string, command: string) => any;
    isOnCooldown: (bot: ExtendedBot, channel: string, command: string, user: string) => boolean;
    setCooldown: (bot: ExtendedBot, channel: string, command: string, user: string) => void;
    updateCommandSetting: (
      bot: ExtendedBot, 
      channel: string, 
      commandName: string, 
      setting: 'active' | 'modOnly' | 'cooldown' | 'whitelist', 
      value: boolean | number | string[]
    ) => void;
    addToWhitelist: (bot: ExtendedBot, channel: string, commandName: string, username: string) => void;
    removeFromWhitelist: (bot: ExtendedBot, channel: string, commandName: string, username: string) => void;
    getCustomCommand: (bot: ExtendedBot, channel: string, commandName: string) => CustomCommand | null;
    addCustomCommand: (bot: ExtendedBot, channel: string, commandName: string, response: string, creator: string) => void;
    editCustomCommand: (bot: ExtendedBot, channel: string, commandName: string, newResponse: string, editor: string) => void;
    removeCustomCommand: (bot: ExtendedBot, channel: string, commandName: string) => void;
    listCustomCommands: (bot: ExtendedBot, channel: string) => string[];
    processVariables: (response: string, context: any) => string;
    loadChannels: () => string[];
    saveChannels: (channels: string[]) => void;
    addChannel: (channel: string) => void;
    removeChannel: (channel: string) => void;
    isInChannel: (channel: string) => boolean;
  };
  join: (channel: string) => Promise<void>;
  leave: (channel: string) => Promise<void>;
  quit: () => Promise<void>;
      authProvider: AuthProvider;

};