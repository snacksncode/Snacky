import { Message } from "discord.js";
import { colors } from "../../config";
import outputEmbed from "../../utils/outputEmbed";

const cumCommand = (msg: Message) => {
  msg.member
    .setNickname("cum")
    .then((_) => {
      msg.channel.send(
        `:sweat_drops: I declare you the lord of **cum** :sweat_drops:`
      );
    })
    .catch((_) => {
      outputEmbed(
        msg.channel,
        `> Thou shall not changeth the nickname of a person whose highest rank is more elevated
        ~ Steve Jobs`,
        colors.error,
        "Unable to change nickname"
      );
    });
};

export default cumCommand;
