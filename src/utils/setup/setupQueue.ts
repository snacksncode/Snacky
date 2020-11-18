import { Client } from "discord.js";

function setupQueue(bot: Client) {
  bot.guildsQueue = new Map();
}

export default setupQueue;
