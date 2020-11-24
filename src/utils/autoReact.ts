import { GuildEmoji, Message } from "discord.js";
import getEmojiByName from "./getEmojiByName";

function autoReact(
  msg: Message,
  channelId: string,
  reactionEmoji: string | GuildEmoji,
  customReactionEmoji: boolean,
  filterOption: "images_only" | "none"
) {
  if (channelId !== msg.channel.id) return;
  if (filterOption === "images_only") {
    if (!(msg.attachments.size > 0 || msg.embeds.length > 0)) return;
  }
  if (customReactionEmoji && typeof reactionEmoji === "string") {
    reactionEmoji = getEmojiByName(reactionEmoji, msg.client);
  }
  msg.react(reactionEmoji);
}

export default autoReact;
