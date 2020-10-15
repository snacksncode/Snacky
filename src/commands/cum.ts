import { Message } from "discord.js";
import outputEmbedMessage from "../utils/outputEmbedMessage";

const cumCommand = (msg: Message) => {
  msg.member.setNickname("cum").then(_ => {
    msg.channel.send(`:sweat_drops: I declare you the lord of **cum** :sweat_drops:`)
  }).catch(err => {
    outputEmbedMessage(`Thou shall not changeth the nickname of a person whose highest rank is more elevated`, msg, 'error');
  })
}

export default cumCommand;