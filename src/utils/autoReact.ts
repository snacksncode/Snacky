import { Message, EmojiResolvable } from "discord.js";

function autoReact(
  msg: Message,
  channels: string[],
  reaction: EmojiResolvable,
  filterFunction?: (m: Message) => boolean
) {
  if (!channels.includes(msg.channel.id)) return;
  if (filterFunction && !filterFunction(msg)) return;
  msg.react(reaction);
}

export default autoReact;
