import { DMChannel, MessageEmbed, NewsChannel, TextChannel, User } from "discord.js";

type destType = TextChannel | DMChannel | NewsChannel | User;

function sendMsg(dest: destType, msg: MessageEmbed | string) {
  return dest.send(msg);
}

export default sendMsg;
