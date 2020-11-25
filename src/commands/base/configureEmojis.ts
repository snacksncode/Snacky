import { Message } from "discord.js";
import { colors } from "../../config";
import outputEmbed from "../../utils/outputEmbed";
import setupReactionEmojis from "../../utils/setup/setupReactionEmojis";

function configureEmojis(msg: Message) {
  const createdEmojis = setupReactionEmojis(msg.guild, true);
  if (createdEmojis.length > 0) {
    outputEmbed(msg.channel, `Configured ${createdEmojis.length} new emojis`, {
      color: colors.info,
      author: msg.author,
      title: "Success",
    });
  } else {
    outputEmbed(msg.channel, `Custom reaction emojis are already configured on this server`, {
      color: colors.success,
      author: msg.author,
      title: "Already configured",
    });
  }
}

export default configureEmojis;
