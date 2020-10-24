import { TextChannel, DMChannel, NewsChannel, MessageEmbed, User } from "discord.js";
import sendMsg from "./sendMsg";
import { colors } from "../config";

type EmbedType = "info" | "error" | "success";
type ChannelType = TextChannel | DMChannel | NewsChannel | User;

function outputEmbed(
  dest: ChannelType,
  message: string,
  type: EmbedType,
  customTitle?: string
) {
  const bot = dest.client.user;
  const embedColor = (type: EmbedType): number => {
    if (type === "error") return colors.error;
    else if (type === "info") return colors.info;
    else if (type === "success") return colors.success;
  };

  const embedTitle = (type: EmbedType): string => {
    if (customTitle) {
      return customTitle;
    } else if (type === "error") return "Error!";
    else if (type === "info") return "Info";
    else if (type === "success") return "Success!";
  };

  const embed: MessageEmbed = new MessageEmbed()
    .setAuthor(bot.tag, bot.avatarURL())
    .setTitle(embedTitle(type))
    .setColor(embedColor(type))
    .setDescription(message);

  return sendMsg(dest, embed);
}
export default outputEmbed;
