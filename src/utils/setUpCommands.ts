import { Client, Collection } from "discord.js";
import commands from "../commands";

function setUpCommands(bot: Client) {
  bot.commands = new Collection();
  Object.keys(commands).forEach((key) => {
    bot.commands.set(commands[key].commandName, commands[key]);
  });
}

export default setUpCommands;
