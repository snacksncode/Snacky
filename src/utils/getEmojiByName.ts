import { Client } from "discord.js";

function getEmojiByName(name: string, client: Client) {
  return client.emojis.cache.find((emoji) => emoji.name === name);
}

export default getEmojiByName;
