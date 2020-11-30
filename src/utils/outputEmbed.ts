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

interface EmbedOptions {
  title: string;
  color?: string;
  fields?: EmbedFieldData[];
}

function outputEmbed(dest: ChannelType, message: string, options: EmbedOptions) {
  const { color, title, fields } = options;
  const embed: MessageEmbed = new MessageEmbed()
    .setTitle(title ? title : "")
    .setColor(color ? color : colors.default)
    .setDescription(message);

  if (fields) embed.addFields(fields);
  if (!!process.env.LOCALHOST) {
    embed.setFooter("Bot is currently under development");
  }
  return sendMsg(dest, embed);
}
export default outputEmbed;
