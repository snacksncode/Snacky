import { Message, TextChannel } from "discord.js";
import outputEmbed from "../../utils/outputEmbed";

const pingCommand = (msg: Message, channel: TextChannel): void => {
  const botLatency = Date.now() - msg.createdTimestamp;
  const apiLatency = channel.client.ws.ping;

  outputEmbed(
    `Bot latency **${botLatency}ms** | Discord Api latency **${apiLatency}ms**`,
    msg,
    "success",
    "Pong! Connection established!"
  );
};
export default pingCommand;
