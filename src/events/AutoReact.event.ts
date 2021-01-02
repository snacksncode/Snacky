import { BotClient, Event, Message, AutoReactionChannel } from "discord.js";
import EventBase from "../base/Event";
import { getEmojiById, outputEmbed } from "../utils/generic";

class AutoReact extends EventBase implements Event {
  CHANNELS_CONFIG: AutoReactionChannel[];
  emojis: {
    success: string;
    error: string;
  };
  constructor(client: BotClient) {
    super(client, {
      eventName: "autoReact",
    });
    this.emojis = this.client.config.reactionEmojis;
    this.CHANNELS_CONFIG = [
      {
        id: "764252519412137994",
        filter: (m) => m.attachments.size > 0 || m.embeds.length > 0,
        emojis: [
          {
            emoji: "❤️",
            customEmoji: false,
          },
        ],
      },
      {
        id: "783337140749598760",
        filter: (m) => m.content.startsWith("["),
        emojis: [
          {
            emoji: this.emojis.error,
            customEmoji: true,
          },
          {
            emoji: this.emojis.success,
            customEmoji: true,
          },
        ],
      },
      {
        id: "764256491426283540",
        filter: (m) => m.attachments.size > 0 || m.embeds.length > 0,
        emojis: [
          {
            emoji: "❤️",
            customEmoji: false,
          },
        ],
      },
      {
        id: "771880244905902090",
        filter: () => true,
        emojis: [
          {
            emoji: "⏸️",
            customEmoji: false,
          },
        ],
      },
    ];
  }
  async run(msg: Message) {
    const configuredChannels = this.CHANNELS_CONFIG;
    for (let channel of configuredChannels) {
      const { id, filter, emojis } = channel;
      if (id !== msg.channel.id) continue;
      if (!filter(msg)) continue;
      for (let reactionEmoji of emojis) {
        if (reactionEmoji.customEmoji) {
          reactionEmoji.emoji = getEmojiById(
            reactionEmoji.emoji as string,
            this.client
          );
        }
        try {
          await msg.react(reactionEmoji.emoji);
        } catch (err) {
          outputEmbed(
            msg.channel,
            `There was an error whilst trying to auto-react to message`,
            {
              color: this.client.config.colors.error,
            }
          );
        }
      }
    }
  }
}

module.exports = AutoReact;
