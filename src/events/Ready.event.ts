import { BotClient, Event } from "discord.js";
import EventBase from "../base/Event";
import consoleColor from "colors";

class ReadyEvent extends EventBase implements Event {
  constructor(client: BotClient) {
    super(client, {
      eventName: "ready",
    });
  }
  setupCustomPresence() {
    const isRunningLocally = process.env.SHOW_LOCALHOST === "enabled";
    const presenceText = isRunningLocally
      ? `Currently under developing • ver. ${this.client.config.version}`
      : `${this.client.config.prefix}help • ver. ${this.client.config.version}`;
    this.client.user.setPresence({
      activity: {
        name: presenceText,
        type: "LISTENING",
      },
      status: "online",
    });
  }
  async run() {
    this.client.logger.log(
      { name: "Client: Ready", color: "success" },
      `Bot has fully loaded and logged in as ${consoleColor.bold.yellow(this.client.user.tag)}`
    );
    this.setupCustomPresence();
  }
}

module.exports = ReadyEvent;
