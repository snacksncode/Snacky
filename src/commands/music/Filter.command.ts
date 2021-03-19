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
import { outputEmbed, removePrefix } from "../../utils/generic";

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
            value: "Enter a more advanced mode and create your own filter",
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
            this.handleCustomFilterCreation(msg);
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
  async handleCustomFilterCreation(msg: Message) {
    //set client to ignore unknown commands
    this.client.config.ignoreUnknownCommands = true;
    //some fancy output
    await outputEmbed(
      msg.channel,
      "You can now create your own filter from scratch. You can add bass, normalization and change speed",
      {
        color: this.client.config.colors.info,
        title: "Create your own filter!",
        fields: [
          {
            name: "Bass",
            value:
              "Use `s!bass <amount>` to set bass-boost amount (in dB).\n**Allowed values: 5 - 25**",
          },
          {
            name: "Audio Normalization",
            value:
              "Use `s!norm <on|off>` to enable audio normalizaion. It'll try to lower audio volume to remove any distortions that may be caused by bass-boost. If you want to make some distorted bass don't enable this feature",
          },
          {
            name: "Custom Speed",
            value:
              "Use `s!speed <custom-speed>` to set custom speed.\n**Allowed values: 0.05 - 4.00**",
          },
          {
            name: "8D",
            value:
              'Use `s!rotation <number|off>` to enable "8D" effect. Audio will spin around your head with specified speed.\n**Recommended values: 0.01 - 2**',
          },
        ],
      }
    );
    const editQueueCommandsFilter = (m: Message) => {
      return m.content.startsWith(this.client.config.prefix) && m.author.id === msg.author.id;
    };
    const timeLimit = 5 * 60 * 1000; //5min
    const collector = msg.channel.createMessageCollector(editQueueCommandsFilter, {
      time: timeLimit,
    });
    collector
      .on("collect", async (m: Message) => {
        const userInput = removePrefix(m.content.trim(), this.client.config.prefix);
        const args = userInput.split(" ");
        const command = args.shift().toLowerCase();
        switch (command) {
          case "bass":
            break;
          case "norm":
            break;
          case "speed":
            break;
          case "rotation":
            break;
          case "exit":
            collector.stop();
            return;
        }
      })
      .on("end", (collected) => {
        this.client.config.ignoreUnknownCommands = false;
        let exitString = "Exited filter creation mode";
        if (collected.size < 1) {
          exitString = "Exited filter creation mode due to inactivity";
        }
        outputEmbed(msg.channel, exitString, {
          color: this.client.config.colors.info,
        });
      });
  }
}

module.exports = Filter;
