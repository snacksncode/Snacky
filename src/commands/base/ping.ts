import { Message, TextChannel } from "discord.js";
import outputEmbed from "../../utils/outputEmbed";

const pingCommand = (msg: Message, channel: TextChannel): void => {
  const messageTimestamp =
    msg.editedTimestamp - msg.createdTimestamp > 0
      ? msg.editedTimestamp
      : msg.createdTimestamp;

  const botLatency = Date.now() - messageTimestamp;
  const apiLatency = channel.client.ws.ping;

  outputEmbed(
    msg.channel,
    `Bot latency **${botLatency}ms** | Discord Api latency **${apiLatency}ms**`,
    "success",
    "Pong! Connection established!"
  );
};
export default pingCommand;
