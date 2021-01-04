import { Message, CommandInterface, BotClient } from "discord.js";
import Command from "../../base/Command";

class ForceError extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "_force_error",
      description: "Throws an Error. Used for testing",
      usage: `<prefix>_force_error`,
      category: "Special",
      hidden: true,
    });
  }

  async run(_msg: Message) {
    this.client.emit("fakeCrashEvent");
    throw new Error("This is a test error. Nothing actually broke.");
  }
}

module.exports = ForceError;
