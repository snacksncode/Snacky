//Commands exporter file
import { Commands, Message } from "discord.js";
import { prefix } from "../config";
import formatHelp from "../utils/formatHelp";
import pingCommand from "./base/ping";
import cumCommand from "./fun/cum";

// export {
//   avatarCommand,
//   clearCommand,
//   cumCommand,
//   helpCommand,
//   pingCommand,
//   rollDiceCommand,
//   muteCommand,
//   unmuteCommand,
// };

const commands: Commands = {
  ping: {
    commandName: "ping",
    aliases: ["p"],
    desc: "Check latency of Discord's API and Bot's respond time",
    exec: (m: Message) => pingCommand(m),
    get help() {
      return formatHelp({
        Description: this.desc,
        Usage: `${prefix}ping`,
      });
    },
  },
  cum: {
    commandName: "cum",
    aliases: ["cummies"],
    desc: "Sets your nickname to cum",
    exec: (m: Message) => cumCommand(m),
    get help() {
      return formatHelp({
        Description: this.desc,
        Usage: `${prefix}cum`,
      });
    },
  },
};
export default commands;
