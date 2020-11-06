//Commands exporter file
import { CommandsExporter, Message } from "discord.js";

import { prefix, ownerId } from "../config";
import formatHelp from "../utils/formatHelp";
import helpCommand from "./base/help";

import pingCommand from "./base/ping";
import uptimeCommand from "./base/uptime";
import avatarCommand from "./fun/avatar";
import cumCommand from "./fun/cum";
import rollDiceCommand from "./fun/rollDice";
import clearCommand from "./moderation/clear";
import muteCommand from "./moderation/mute";
import unmuteCommand from "./moderation/unmute";

// export {
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
        desc: this.desc,
        usage: `${prefix}ping`,
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
        desc: this.desc,
        usage: `${prefix}cum`,
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
        aliases: this.aliases,
        desc: this.desc,
        usage: `${prefix}avatar [user?] [--size?]`,
        example: `\n${prefix}avatar <@${ownerId}> --size=512\n${prefix}avatar`,
      });
    },
  },
  help: {
    commandName: "help",
    desc: "Get help with using Snacky",
    exec: (m: Message) => helpCommand(m),
    help: function () {
      return formatHelp({
        desc: this.desc,
        usage: `\n${prefix}help\n${prefix}help [command]`,
      });
    },
  },
  uptime: {
    commandName: "uptime",
    desc: "Get info about how long the bot has been running",
    exec: (m: Message) => uptimeCommand(m),
    help: function () {
      return formatHelp({
        desc: this.desc,
        usage: `${prefix}uptime`,
      });
    },
  },
  clear: {
    aliases: ["c", "purge"],
    commandName: "clear",
    requiredPermissions: ["Administrator", "Manage messages"],
    desc: "Remove last <x> amount of messages",
    exec: (m: Message) => clearCommand(m),
    help: function () {
      return formatHelp({
        aliases: this.aliases,
        desc: this.desc,
        usage: `${prefix}clear [user?] [--include-command?] [amount 1-100]`,
        reqPerms: this.requiredPermissions,
        example: `\n${prefix}clear 5\n${prefix}purge <@${ownerId}> 10\n${prefix}c 5 --include-command`,
      });
    },
  },
  roll: {
    aliases: ["rolldice", "dice"],
    commandName: "roll",
    desc: "Rolls a virtual dice for you",
    exec: (m: Message) => rollDiceCommand(m),
    help: function () {
      return formatHelp({
        aliases: this.aliases,
        desc: this.desc,
        usage: `${prefix}roll [dice]`,
        example: `\n${prefix}roll d6 2d10\n${prefix}rolldice 5d6\n${prefix}dice d100`,
      });
    },
  },
  mute: {
    aliases: ["m", "silence"],
    commandName: "mute",
    desc: "Gives mentioned member(s) `muted` role",
    exec: (m: Message) => muteCommand(m),
    help: function () {
      return formatHelp({
        aliases: this.aliases,
        desc: this.desc,
        usage: `${prefix}mute [user(s)]`,
        example: `\n${prefix}mute <@${ownerId}>`,
      });
    },
  },
  unmute: {
    aliases: ["um", "unsilence"],
    commandName: "unmute",
    desc: "Removes `muted` role from mentioned member(s)",
    exec: (m: Message) => unmuteCommand(m),
    help: function () {
      return formatHelp({
        aliases: this.aliases,
        desc: this.desc,
        usage: `${prefix}unmute [user(s)]`,
        example: `\n${prefix}unmute <@${ownerId}>`,
      });
    },
  },
};
export default commands;
