import { Message } from "discord.js";
import { colors } from "../../config";
import outputEmbed from "../../utils/outputEmbed";

function pingCommand(msg: Message): void {
  const originalMsgTimestamp =
    msg.editedTimestamp - msg.createdTimestamp > 0
      ? msg.editedTimestamp
      : msg.createdTimestamp;

  const apiLatency = msg.channel.client.ws.ping;

  outputEmbed(
    msg.channel,
    `Discord API latency:  **${apiLatency}ms**`,
    colors.success,
    "Pong! Connection established!"
  ).then((_msg: Message) => {
    const responseLatency = _msg.createdTimestamp - originalMsgTimestamp;
    outputEmbed(
      msg.channel,
      `Bot latency: **${responseLatency}ms**`,
      colors.success
    );
  });
}

// export default {
//   desc: "Get help with specific command",
//   exec: (m: Message, c: TextChannel) => pingCommand(m, c),
//   get help() {
//     return formatHelp({
//       Description: this.desc,
//       Usage: `${prefix}help <command>`,
//     });
//   },
// };

export default pingCommand;
