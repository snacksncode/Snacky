import { Message, CommandInterface, BotClient } from "discord.js";
import Command from "../../base/Command";
import { outputEmbed } from "../../utils/generic";

class Ping extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "ping",
      aliases: ["latency"],
      description: "Shows current DiscordAPI latency and estimated bot response time",
      usage: `<prefix>ping`,
      category: "Information",
    });
  }

  async run(msg: Message) {
    const successColor = this.client.config.colors.success;
    outputEmbed(msg.channel, `Current web socket's ping is **\`${this.getApiLatency()}ms\`**`, {
      color: successColor,
      title: "Connection established!",
    });
  }

  getApiLatency() {
    return this.client.ws.ping;
  }
}

module.exports = Ping;
