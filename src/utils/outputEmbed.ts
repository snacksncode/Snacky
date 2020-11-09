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
	.setAuthor(
	  bot.tag.substring(0, bot.tag.indexOf("#")), 
	  bot.avatarURL()
	)
	.setTitle(title ? title : "")
	.setColor(color ? color : colors.default)
	.setDescription(message);

  if (fields) embed.addFields(fields);
  if (!!process.env.LOCALHOST) {
	embed.setFooter("I'm running on localhost", "https://i.imgur.com/sPnI3Se.png");
  }

  return sendMsg(dest, embed);
}
export default outputEmbed;
