// import { AutoReactionChannel, CustomReactionEmoji } from "discord.js";

import { Config } from "discord.js";

const config: Config = {
  prefix: "s!",
  token: process.env.TOKEN,
  version: "2.0 Beta",
  paths: {
    commands: "/commands/**/*.command.ts", //you can use pattern matching here
    events: "/events/**/*.event.ts",
  },
  colors: {
    // info: "#3d5eeb",
    info: "#4895ef",
    success: "#45bb8a",
    warn: "#ffcc4d",
    error: "#ef4949",
  },
  reactionEmojis: {
    success: {
      name: "snky_success",
      url: "https://i.imgur.com/y9dhF8w.png",
    },
    error: {
      name: "snky_error",
      url: "https://i.imgur.com/iU5CiGs.png",
    },
  },
  ownerId: "430795391265406990",
};

export default config;
// const autoReactChannels: AutoReactionChannel[] = [
//   {
//     id: "764252519412137994",
//     filter: (m) => m.attachments.size > 0 || m.embeds.length > 0,
//     emojis: [
//       {
//         emoji: "❤️",
//         customEmoji: false,
//       },
//     ],
//   },
//   {
//     id: "783337140749598760",
//     filter: (m) => m.content.startsWith("["),
//     emojis: [
//       {
//         emoji: "snky_error",
//         customEmoji: true,
//       },
//       {
//         emoji: "snky_success",
//         customEmoji: true,
//       },
//     ],
//   },
//   {
//     id: "764256491426283540",
//     filter: (m) => m.attachments.size > 0 || m.embeds.length > 0,
//     emojis: [
//       {
//         emoji: "❤️",
//         customEmoji: false,
//       },
//     ],
//   },
//   {
//     id: "771880244905902090",
//     filter: () => true,
//     emojis: [
//       {
//         emoji: "⏸️",
//         customEmoji: false,
//       },
//     ],
//   },
// ];
