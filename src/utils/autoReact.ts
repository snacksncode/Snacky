import { Message } from "discord.js";

function autoReact(
  msg: Message,
  channels: string[],
  reaction: string,
  filterFunction?: (m: Message) => boolean
) {
  if (!channels.includes(msg.channel.id)) return;
  if (filterFunction && !filterFunction(msg)) return;
  msg.react(reaction);
}

export default autoReact;
