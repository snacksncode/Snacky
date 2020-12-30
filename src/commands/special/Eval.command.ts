import { Message, CommandInterface, BotClient } from "discord.js";
import Command from "../../base/Command";
import { outputEmbed } from "../../utils/generic";

class Eval extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "eval",
      description: "Executes JS code provided after command invocation",
      usage: `<prefix>eval [code]`,
      category: "Special",
      hidden: true,
    });
  }

  run(msg: Message) {
    outputEmbed(msg.channel, "This is currently being developed.", {
      color: this.client.config.colors.warn,
      footerText: "Also this is owner-only but I haven't implemented it yet",
    });
  }
}

module.exports = Eval;
