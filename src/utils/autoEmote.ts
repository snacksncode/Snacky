import { Message } from "discord.js";

function autoEmote(
  msg: Message,
  channelId: string,
  emote: string,
  filterFunction: (m: Message) => boolean
) {
  if (msg.channel.id !== channelId) return;
  if (!filterFunction(msg)) return;
  msg.reactions.add(emote);
}

export default autoEmote;
