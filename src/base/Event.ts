import { BotClient, EventBaseInterface } from "discord.js";

interface EventOptions {
  eventName: string;
}

class EventBase implements EventBaseInterface {
  client: BotClient;
  eventName: string;
  constructor(_client: BotClient, options: EventOptions) {
    this.client = _client;
    this.eventName = options.eventName;
  }
}

export default EventBase;
