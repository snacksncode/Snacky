import { DMChannel, MessageEmbed, NewsChannel, TextChannel, User } from "discord.js";

type destType = TextChannel | DMChannel | NewsChannel | User;

function sendMsg(dest: destType, msg: MessageEmbed | string, isDm?: boolean) {
  return dest.send(msg).catch((err) => {
    console.error(err);
  });
}

export default sendMsg;
