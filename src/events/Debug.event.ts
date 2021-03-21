import { BotClient, Event } from "discord.js";
import EventBase from "../base/Event";

class DebugEvent extends EventBase implements Event {
  constructor(client: BotClient) {
    super(client, {
      eventName: "debug",
      ignoreEvent: !client.config.debugMode,
    });
  }
  async run(info: string) {
    this.client.logger.log({ name: "Debug", color: "warning" }, `${info}`);
  }
}

module.exports = DebugEvent;
