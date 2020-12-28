import { Message, CommandInterface, BotClient } from "discord.js";
import Command from "../../base/Command";
import { formatMs, outputEmbed } from "../../utils/generic";

class Uptime extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "uptime",
      description: "Shows for how long bot has been running",
      usage: "<prefix>uptime",
      aliases: ["runtime"],
      category: "Information",
    });
  }

  run(msg: Message) {
    const uptime = formatMs(this.client.uptime);
    outputEmbed(msg.channel, `Snacky has been up for **${uptime}**`, {
      color: this.client.config.colors.info,
    });
  }
}

module.exports = Uptime;
