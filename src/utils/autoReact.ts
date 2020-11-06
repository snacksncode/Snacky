import { Message } from "discord.js";

function autoReact(
  msg: Message,
  channelId: string,
  reaction: string,
  filterFunction: (m: Message) => boolean
) {
  if (msg.channel.id !== channelId) return;
  if (!filterFunction(msg)) return;
  msg.react(reaction);
}

export default autoReact;
