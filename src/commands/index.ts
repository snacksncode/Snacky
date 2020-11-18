//Commands exporter file
import { CommandsExporter, Message } from "discord.js";

import { prefix, ownerId } from "../config";
import formatHelp from "../utils/formatHelp";
import configureEmojis from "./base/configureEmojis";
import helpCommand from "./base/help";

import pingCommand from "./base/ping";
import uptimeCommand from "./base/uptime";
import avatarCommand from "./fun/avatar";
import cumCommand from "./fun/cum";
import jdCommand from "./fun/jd";
import rollDiceCommand from "./fun/rollDice";
import clearCommand from "./moderation/clear";
import muteCommand from "./moderation/mute";
import unmuteCommand from "./moderation/unmute";
import playCommand from "./music/play";
import skipCommand from "./music/skip";
import stopCommand from "./music/stop";

// import bassboost from "./music/_bassboost";
// import join from "./music/_join";
// import leave from "./music/_leave";
// import loop from "./music/_loop";
// import pause from "./music/_pause";
// import play from "./music/_play";
// import queue from "./music/_queue";
// import resume from "./music/_resume";
// import skip from "./music/_skip";
// import stop from "./music/_stop";
// import volume from "./music/_volume";

const commands: CommandsExporter = {
  ping: {
    commandName: "ping",
    aliases: ["latency"],
    desc: "Check latency of Discord's API and Bot's respond time",
    exec: (m: Message) => pingCommand(m),
    help: function () {
      return formatHelp({
        aliases: this.aliases,
        desc: this.desc,
        usage: `${prefix}ping`,
      });
    },
  },
  jd: {
    commandName: "jd",
    aliases: ["jebacdisa", "jdkurwe", "orkpls", "orkjebany", "dis"],
    desc: "Send you a friendly image on a polish orc",
    exec: (m: Message) => jdCommand(m),
    help: function () {
      return formatHelp({
        aliases: this.aliases,
        desc: this.desc,
        usage: `${prefix}jd`,
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
        aliases: this.aliases,
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
  configureemojis: {
    commandName: "configureemojis",
    desc: "Configures needed reaction emojis Snacky uses",
    exec: (m: Message) => configureEmojis(m),
    hidden: true,
    help: function () {
      return formatHelp({
        desc: this.desc,
        usage: `${prefix}configureEmojis`,
      });
    },
  },
  // music section
  // join: {
  //   aliases: ["j"],
  //   commandName: "join",
  //   desc: "Bot join your channel",
  //   exec: join,
  //   help: function () {
  //     return formatHelp({
  //       aliases: this.aliases,
  //       desc: this.desc,
  //       usage: `${prefix}join`,
  //       example: `\n${prefix}join`,
  //     });
  //   },
  // },
  play: {
    aliases: ["p"],
    commandName: "play",
    desc: "Bot joins VC user is currently in and plays audio from video",
    exec: (m: Message) => playCommand(m),
    help: function () {
      return formatHelp({
        aliases: this.aliases,
        desc: this.desc,
        usage: `${prefix}play [youtube link or title of a video]`,
        example: `\n${prefix}play exyl ping\n${prefix}p https://www.youtube.com/watch?v=zDE3DBvmvhE`,
      });
    },
  },
  // leave: {
  //   aliases: ["l"],
  //   commandName: "leave",
  //   desc: "Bot leaves your channel",
  //   exec: leave,
  //   help: function () {
  //     return formatHelp({
  //       aliases: this.aliases,
  //       desc: this.desc,
  //       usage: `${prefix}leave`,
  //       example: `\n${prefix}leave`,
  //     });
  //   },
  // },
  stop: {
    aliases: ["s"],
    commandName: "stop",
    desc: "Bot stops playing music and removes all songs from queue",
    exec: (m: Message) => stopCommand(m),
    help: function () {
      return formatHelp({
        aliases: this.aliases,
        desc: this.desc,
        usage: `${prefix}stop`,
      });
    },
  },
  // pause: {
  //   aliases: [],
  //   commandName: "pause",
  //   desc: "Bot pauses current song",
  //   exec: pause,
  //   help: function () {
  //     return formatHelp({
  //       aliases: this.aliases,
  //       desc: this.desc,
  //       usage: `${prefix}pause`,
  //       example: `\n${prefix}pause`,
  //     });
  //   },
  // },
  // resume: {
  //   aliases: ["r"],
  //   commandName: "resume",
  //   desc: "Bot resumes current song",
  //   exec: resume,
  //   help: function () {
  //     return formatHelp({
  //       aliases: this.aliases,
  //       desc: this.desc,
  //       usage: `${prefix}resume`,
  //       example: `\n${prefix}resume`,
  //     });
  //   },
  // },
  skip: {
    aliases: ["sk"],
    commandName: "skip",
    desc: "Snacky skips currently playing song",
    exec: (m: Message) => skipCommand(m),
    help: function () {
      return formatHelp({
        aliases: this.aliases,
        desc: this.desc,
        usage: `${prefix}skip`,
      });
    },
  },
  // queue: {
  //   aliases: ["q"],
  //   commandName: "queue",
  //   desc: "Bot displays current queue",
  //   exec: queue,
  //   help: function () {
  //     return formatHelp({
  //       aliases: this.aliases,
  //       desc: this.desc,
  //       usage: `${prefix}queue`,
  //       example: `\n${prefix}queue`,
  //     });
  //   },
  // },
  // loop: {
  //   aliases: [],
  //   commandName: "loop",
  //   desc: "Bot loops current song",
  //   exec: loop,
  //   help: function () {
  //     return formatHelp({
  //       aliases: this.aliases,
  //       desc: this.desc,
  //       usage: `${prefix}loop`,
  //       example: `\n${prefix}loop`,
  //     });
  //   },
  // },
  // bassboost: {
  //   aliases: ["bb"],
  //   commandName: "bassboost",
  //   desc: "Bot bass boosts current song",
  //   exec: bassboost,
  //   help: function () {
  //     return formatHelp({
  //       aliases: this.aliases,
  //       desc: this.desc,
  //       usage: `${prefix}bassboost`,
  //       example: `\n${prefix}bassboost`,
  //     });
  //   },
  // },
  // volume: {
  //   aliases: ["v"],
  //   commandName: "volume",
  //   desc: "Bot change song volume",
  //   exec: volume,
  //   help: function () {
  //     return formatHelp({
  //       aliases: this.aliases,
  //       desc: this.desc,
  //       usage: `${prefix}volume <0 - 2>`,
  //       example: `\n${prefix}volume 0.55`,
  //     });
  //   },
  // },
};
export default commands;
