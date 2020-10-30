import {
  TextChannel,
  DMChannel,
  NewsChannel,
  MessageEmbed,
  User,
  EmbedFieldData,
} from "discord.js";
import sendMsg from "./sendMsg";
import { colors } from "../config";

type ChannelType = TextChannel | DMChannel | NewsChannel | User;

function outputEmbed(
  dest: ChannelType,
  message: string,
  color?: string,
  title?: string,
  fields?: EmbedFieldData[]
) {
  const bot = dest.client.user;
  const embed: MessageEmbed = new MessageEmbed()
    .setAuthor(bot.tag, bot.avatarURL())
    .setTitle(title ? title : "")
    .setColor(color ? color : colors.default)
    .setDescription(message);

  if (fields) embed.addFields(fields);

  return sendMsg(dest, embed);
}
export default outputEmbed;
