import { AutoReactionEmojis, Message } from "discord.js";
import { colors } from "../config";
import getEmojiByName from "./getEmojiByName";
import outputEmbed from "./outputEmbed";

async function autoReact(
  msg: Message,
  channelId: string,
  reactionEmojis: AutoReactionEmojis[],
  filterOption: (m: Message) => boolean
) {
  if (channelId !== msg.channel.id) return;
  if (!filterOption(msg)) return;
  for (let reactionEmoji of reactionEmojis) {
    if (reactionEmoji.customEmoji && typeof reactionEmoji.emoji === "string") {
      reactionEmoji.emoji = getEmojiByName(reactionEmoji.emoji, msg.client);
    }
    try {
      await msg.react(reactionEmoji.emoji);
    } catch (err) {
      outputEmbed(msg.channel, `There was an error whilst trying to auto-react to message`, {
        color: colors.error,
      });
    }
  }
}

export default autoReact;
