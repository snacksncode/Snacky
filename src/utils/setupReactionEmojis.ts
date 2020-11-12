import { CustomReactionEmoji, Guild } from "discord.js";

import { reactionEmojis } from "../config";
import consoleColors from "colors";

function setupReactionEmojis(guild: Guild, manualRequest?: boolean) {
  let createdEmojis: CustomReactionEmoji[] = [];
  if (manualRequest) {
    console.log(`${consoleColors.dim.bold("[ Manual request to check Emojis ]")}`);
  }
  for (const emoji of Object.values(reactionEmojis)) {
    if (!guild.emojis.cache.some((guildEmoji) => guildEmoji.name === emoji.name)) {
      console.log(
        `${consoleColors.yellow("[ Emoji ]")} Found missing Emoji. Creating ${emoji.name}...`
      );
      createdEmojis.push(emoji);
      guild.emojis.create(emoji.url, emoji.name);
    }
  }
  if (createdEmojis.length === 0) {
    console.log(`${consoleColors.green("[ Emoji ]")} All needed Emojis are present`);
  } else {
    console.log(`${consoleColors.green("[ Emoji ]")} Created ${createdEmojis.length} new Emoji`);
  }
  return createdEmojis;
}
export default setupReactionEmojis;
