import { Guild } from "discord.js";

function getEmojiByName(name: string, guild: Guild) {
  return guild.emojis.cache.find((emoji) => emoji.name === name);
}

export default getEmojiByName;
