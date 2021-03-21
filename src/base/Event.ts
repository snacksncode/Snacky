import { BotClient, EventBaseInterface } from "discord.js";

interface EventOptions {
  eventName: string;
  ignoreEvent?: boolean;
}

class EventBase implements EventBaseInterface {
  client: BotClient;
  eventName: string;
  ignoreEvent: boolean;
  constructor(_client: BotClient, options: EventOptions) {
    this.client = _client;
    this.eventName = options.eventName;
    this.ignoreEvent = options.ignoreEvent || false;
  }
}

export default EventBase;
