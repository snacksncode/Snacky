import { Message } from "discord.js";
import { colors } from "../../config";
import outputEmbed from "../../utils/outputEmbed";

function pingCommand(msg: Message): void {
  const originalMsgTimestamp =
    msg.editedTimestamp - msg.createdTimestamp > 0 ? msg.editedTimestamp : msg.createdTimestamp;

  const apiLatency = msg.channel.client.ws.ping;
  outputEmbed(
    msg.channel,
    `Discord API latency:  **${apiLatency}ms**`,
    colors.success,
    "Connection established!"
  ).then((_msg: Message) => {
    const responseLatency = _msg.createdTimestamp - originalMsgTimestamp;
    outputEmbed(msg.channel, `Bot latency: **${responseLatency}ms**`, colors.success);
  });
}

export default pingCommand;
