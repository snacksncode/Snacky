import { BotClient, Event, AutoReactionChannel } from "discord.js";
import EventBase from "../base/Event";

class AutoReact extends EventBase implements Event {
  CHANNELS_CONFIG: AutoReactionChannel[];
  emojis: {
    success: string;
    error: string;
  };
  constructor(client: BotClient) {
    super(client, {
      eventName: "fakeCrashEvent",
    });
  }
  async run() {
    ([] as any).doShit();
  }
}

module.exports = AutoReact;
