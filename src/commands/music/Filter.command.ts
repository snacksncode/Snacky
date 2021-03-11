import {
  Message,
  CommandInterface,
  BotClient,
  MessageReaction,
  User,
  FilterData,
  PresetName,
  GuildMusicQueue,
} from "discord.js";
import Command from "../../base/Command";
import { outputEmbed } from "../../utils/generic";

const DEFAULT_FILTER_DATA: FilterData = {
  bass: {
    status: "disabled",
    value: 0,
  },
  normalization: {
    status: "disabled",
    value: 200,
  },
  rotate: {
    status: "disabled",
    value: 0,
  },
  speed: {
    status: "disabled",
    value: 1,
  },
};

class Filter extends Command implements CommandInterface {
  filterData: FilterData;
  constructor(client: BotClient) {
    super(client, {
      name: "filter",
      description: "Apply different filters to your music",
      usage: "<prefix>filter",
      category: "Music",
    });
    this.filterData = DEFAULT_FILTER_DATA;
  }
  async run(msg: Message) {
    const guildQueue = this.client.player.getQueue(msg.guild.id);
    const colors = this.client.config.colors;
    try {
      if (!guildQueue) {
        throw "Bot is not currently in voicechat";
      }
      if (!msg.member.voice) {
        throw "You're not currently in voice channel";
      }
      if (msg.member.voice.channel.id !== guildQueue.voiceChannel.id) {
        throw "You're not in the same voice chat as Snacky.";
      }
    } catch (errMsg) {
      return outputEmbed(msg.channel, errMsg, {
        color: colors.warn,
      });
    }
    const answerEmojis = {
      one: "1️⃣",
      two: "2️⃣",
      three: "3️⃣",
      custom: "🛠️",
      off: "⛔",
    };
    const [messageReference] = await outputEmbed(
      msg.channel,
      `You can apply a filter to your songs by selecting one from presets or create your own`,
      {
        color: colors.info,
        title: "Filters",
        fields: [
          {
            name: ":one: Bassboost",
            value:
              "Add more bass to your songs. Audio normalization is also enabled which may make audio a little bit quieter",
          },
          {
            name: ":two: Vaporwave",
            value: "Slows down the song",
          },
          {
            name: ":three: Nightcore",
            value: "Convert any song to nightcore version on a fly",
          },
          {
            name: ":tools: Create your own",
            value: "Enter a more advanced mode and create your own filter without any restrictions",
          },
          {
            name: ":no_entry: Turn Off",
            value: "Disable any currently running filter",
          },
        ],
      }
    );
    //add all the reaction emojis to a message
    for (let emoji of Object.values(answerEmojis)) {
      await messageReference.react(emoji);
    }

    const reactionCollectorIdleTimout = 60000;

    const queueControlsFilter = (reaction: MessageReaction, user: User) => {
      return Object.values(answerEmojis).includes(reaction.emoji.name) && msg.author.id === user.id;
    };

    const collectorInstance = messageReference.createReactionCollector(queueControlsFilter, {
      idle: reactionCollectorIdleTimout,
    });

    collectorInstance
      .on("collect", async (reaction: MessageReaction) => {
        switch (reaction.emoji.name) {
          case answerEmojis.one: {
            this.enablePreset(msg, "bassboost", guildQueue);
            break;
          }
          case answerEmojis.two: {
            this.enablePreset(msg, "vaporwave", guildQueue);
            break;
          }
          case answerEmojis.three: {
            this.enablePreset(msg, "nightcore", guildQueue);
            break;
          }
          case answerEmojis.custom: {
            outputEmbed(msg.channel, `Still under development`, { color: colors.warn });
            break;
          }
          case answerEmojis.off: {
            if (guildQueue.filter.selectedPreset === null) {
              outputEmbed(msg.channel, `Filter is **already** disabled`, { color: colors.info });
              break;
            }
            await this.client.player.filtersManager.disableFilter(msg);
            guildQueue.filter.selectedPreset = null;
            break;
          }
        }
        await reaction.users.remove(msg.author.id);
      })
      .on("end", (_) => {
        messageReference.reactions.removeAll();
      });
  }
  async enablePreset(msg: Message, presetName: PresetName, guildQueue: GuildMusicQueue) {
    if (presetName === guildQueue.filter.selectedPreset) {
      outputEmbed(
        msg.channel,
        `Preset ${presetName === "rotate" ? "8D" : presetName} is **already** enabled`,
        {
          color: this.client.config.colors.info,
        }
      );
      return;
    }
    await this.client.player.filtersManager.generateAndApplyFilter(msg, null, presetName);
    guildQueue.filter.selectedPreset = presetName;
    outputEmbed(
      msg.channel,
      `Preset **${presetName === "rotate" ? "8D" : presetName}** has been enabed`,
      {
        color: this.client.config.colors.success,
      }
    );
  }
}

module.exports = Filter;