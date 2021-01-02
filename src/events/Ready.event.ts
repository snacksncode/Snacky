import { BotClient, Event } from "discord.js";
import EventBase from "../base/Event";

class ReadyEvent extends EventBase implements Event {
  constructor(client: BotClient) {
    super(client, {
      eventName: "ready",
    });
  }
  setupCustomPresence() {
    this.client.user.setPresence({
      activity: {
        name: `${this.client.config.prefix}help • ver. ${this.client.config.version}`,
        type: "LISTENING",
      },
      status: "online",
    });
  }
  run() {
    this.client.logger.log(
      { name: "Client: Ready", color: "success" },
      `Bot has fully loaded and logged in as ${this.client.user.tag}`
    );
    this.setupCustomPresence();
  }
}

module.exports = ReadyEvent;
