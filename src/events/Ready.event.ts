import { BotClient, Event } from "discord.js";
import EventBase from "../base/Event";
import setupCustomPresence from "../utils/setup/setupCustomPresence";

class ReadyEvent extends EventBase implements Event {
  constructor(client: BotClient) {
    super(client, {
      eventName: "ready",
    });
  }
  run() {
    this.client.logger.log(
      { name: "Client: Ready", color: "success" },
      `Bot has fully loaded and logged in as ${this.client.user.tag}`
    );
    setupCustomPresence(this.client);
  }
}

module.exports = ReadyEvent;
