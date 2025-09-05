// ^^^ Decline Command - Universal Rejection Action ^^^

import type { BotCommandContext } from "../../types/index.js";
import { GlobalInteractiveHandler } from "../../utils/globalInteractiveHandler.js";

export default {
  name: "decline",
  description: "Decline an offer, challenge, or proposal",
  defaultModOnly: false,
  globalCooldown: 3,
  execute: async (params: string[], context: BotCommandContext) => {
    await GlobalInteractiveHandler.handleInteractiveCommand("decline", context);
  },
};
