import { AutoReactionChannel, CustomReactionEmoji } from "discord.js";

const token: string = process.env.TOKEN;
const prefix: string = "s!";
const version: string = "1.9.2";
const ownerId: string = "430795391265406990";
const usersAllowedToUseEval: string[] = ["430795391265406990"];
const autoReactChannels: AutoReactionChannel[] = [
  {
    id: "764252519412137994",
    filter: (m) => m.attachments.size > 0 || m.embeds.length > 0,
    emojis: [
      {
        emoji: "❤️",
        customEmoji: false,
      },
    ],
  },
  {
    id: "783337140749598760",
    filter: (m) => m.content.startsWith("["),
    emojis: [
      {
        emoji: "snky_error",
        customEmoji: true,
      },
      {
        emoji: "snky_success",
        customEmoji: true,
      },
    ],
  },
  {
    id: "764256491426283540",
    filter: (m) => m.attachments.size > 0 || m.embeds.length > 0,
    emojis: [
      {
        emoji: "❤️",
        customEmoji: false,
      },
    ],
  },
  {
    id: "771880244905902090",
    filter: () => true,
    emojis: [
      {
        emoji: "⏸️",
        customEmoji: false,
      },
    ],
  },
];
const colors = {
  default: "#1b1b1b",
  info: "#3d5eeb",
  success: "#45bb8a",
  warn: "#ffcc4d",
  error: "#ef4949",
};
const reactionEmojis: { success: CustomReactionEmoji; error: CustomReactionEmoji } = {
  success: {
    name: "snky_success",
    url: "https://i.imgur.com/y9dhF8w.png",
  },
  error: {
    name: "snky_error",
    url: "https://i.imgur.com/iU5CiGs.png",
  },
};

export {
  token,
  prefix,
  version,
  colors,
  ownerId,
  autoReactChannels,
  reactionEmojis,
  usersAllowedToUseEval,
};
