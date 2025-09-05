// ^^^ Shelter Command - Universal Protection Action ^^^

import type { BotCommandContext } from "../../types/index.js";
import { GlobalInteractiveHandler } from "../../utils/globalInteractiveHandler.js";

export default {
  name: "shelter",
  description: "Seek protection or defensive cover",
  defaultModOnly: false,
  globalCooldown: 3,
  execute: async (params: string[], context: BotCommandContext) => {
    await GlobalInteractiveHandler.handleInteractiveCommand("shelter", context);
  },
};
