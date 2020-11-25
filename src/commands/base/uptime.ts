import { Message } from "discord.js";
import { colors } from "../../config";
import formatMs from "../../utils/formatMs";
import outputEmbed from "../../utils/outputEmbed";

function uptimeCommand(msg: Message) {
  let upTime = formatMs(msg.client.uptime);
  outputEmbed(msg.channel, upTime, {
    color: colors.info,
    title: "Snacky has been up for",
    author: msg.author,
  });
}

export default uptimeCommand;
