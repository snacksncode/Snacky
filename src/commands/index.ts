//Commands exporter file
import { CommandsExporter, Message } from "discord.js";

import { prefix, ownerId } from "../config";
import formatHelp from "../utils/formatHelp";
import helpCommand from "./base/help";

import pingCommand from "./base/ping";
import avatarCommand from "./fun/avatar";
import cumCommand from "./fun/cum";

// export {
//   upTime,
//   clearCommand,
//   rollDiceCommand,
//   muteCommand,
//   unmuteCommand,
// };

const commands: CommandsExporter = {
  ping: {
    commandName: "ping",
    aliases: ["latency", "p"],
    desc: "Check latency of Discord's API and Bot's respond time",
    exec: (m: Message) => pingCommand(m),
    help: function () {
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
    help: function () {
      return formatHelp({
        Description: this.desc,
        Usage: `${prefix}cum`,
      });
    },
  },
  avatar: {
    commandName: "avatar",
    aliases: ["av", "avtr"],
    desc: "Shows avatar of author or mentioned user",
    exec: (m: Message) => avatarCommand(m),
    help: function () {
      return formatHelp({
        Aliases: this.aliases,
        Description: this.desc,
        Usage: `${prefix}avatar [user?] [size?]`,
        Example: `\n${prefix}avatar <@${ownerId}> --size=512\n${prefix}avatar`,
      });
    },
  },
  help: {
    commandName: "help",
    desc: "Get help with using Snacky",
    exec: (m: Message) => helpCommand(m),
    help: function () {
      return formatHelp({
        Description: this.desc,
        Usage: `\n${prefix}help\n${prefix}help [command]`,
      });
    },
  },
};
export default commands;
