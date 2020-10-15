import { Message, MessageEmbed } from 'discord.js';

type EmbedType = "info" | "error" | "success";

const outputEmbedMessage = (message: string, msg: Message, type: EmbedType, embedCustomTitle?: string) => {
  const embedColor = (type: EmbedType): string => {
    if (type === "error") return "#ef5350"
    else if (type === "info") return "#5C6BC0"
    else if (type === "success") return "#66BB6A"
  }

  const embedTitle = (type: EmbedType): string => {
    if (embedCustomTitle) {
      return embedCustomTitle
    }
    else if (type === "error") return "Error!"
    else if (type === "info") return "Info"
    else if (type === "success") return "Success!"
  }

  const errorEmber: MessageEmbed = new MessageEmbed()
    .setTitle(embedTitle(type))
    .setColor(embedColor(type))
    .setDescription(message);

  return msg.reply(errorEmber);
}
export default outputEmbedMessage;