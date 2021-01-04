import { BotClient, Event, Message, PartialMessage } from "discord.js";
import EventBase from "../base/Event";

class MessageUpdate extends EventBase implements Event {
  constructor(client: BotClient) {
    super(client, {
      eventName: "messageUpdate",
    });
  }
  async run(
    oldMsg: Message | PartialMessage,
    newMsg: Message | PartialMessage
  ) {
    if (
      newMsg.author.bot ||
      !newMsg.content.startsWith(this.client.config.prefix) ||
      oldMsg.content === newMsg.content
    ) {
      return;
    }

    newMsg.fetch().then((_msg: Message) => {
      this.client.emit("message", _msg);
    });
  }
}

module.exports = MessageUpdate;
