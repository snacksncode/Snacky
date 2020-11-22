import { AutoReactionChannel, CustomReactionEmoji } from "discord.js";

const token: string = process.env.TOKEN;
const prefix: string = "s!";
const version: string = "1.8.3";
const ownerId: string = "430795391265406990";
const autoReactChannels: AutoReactionChannel[] = [
  {
    id: "764252519412137994",
    filter: "images_only",
    emoji: "❤️",
    customEmoji: false,
  },
  {
    id: "764256491426283540",
    filter: "images_only",
    emoji: "❤️",
    customEmoji: false,
  },
  {
    id: "771880244905902090",
    filter: "none",
    emoji: "⏸️",
    customEmoji: false,
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

export { token, prefix, version, colors, ownerId, autoReactChannels, reactionEmojis };
