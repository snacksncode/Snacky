import { Message } from "discord.js";
import { colors } from "../../config";
import outputEmbed from "../../utils/outputEmbed";
import stateReact from "../../utils/stateReact";

const cumCommand = (msg: Message) => {
  msg.member
    .setNickname("cum")
    .then((_) => {
      stateReact(msg, "success");
      msg.channel.send(`:sweat_drops: I declare you the lord of **cum** :sweat_drops:`);
    })
    .catch((_) => {
      stateReact(msg, "error");
      outputEmbed(
        msg.channel,
        `> Thou shall not changeth the nickname of a person whose highest rank is more elevated
        ~ Steve Jobs`,
        {
          color: colors.error,
          title: "Unable to change nickname",
          author: msg.author,
        }
      );
    });
};

export default cumCommand;
