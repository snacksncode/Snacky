import { Message, CommandInterface, BotClient, MessageReaction, User } from "discord.js";
import Command from "../../base/Command";
import { outputEmbed } from "../../utils/generic";

class Filter extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "filter",
      description: "Apply different filters to your music",
      usage: "<prefix>filter",
      category: "Music",
    });
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
            value: "Add more bass to your songs. Audio normalization is also enabled",
          },
          {
            name: ":two: Nightcore",
            value: "Convert any song to nightcore version on a fly",
          },
          {
            name: ":three: 8D",
            value: "Makes a song go in circles around your head",
          },
          {
            name: ":tools: Create your own",
            value: "Enter a more advanced mode and create your own filter without any restrictions",
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
            //enable bassboost preset
            break;
          }
          case answerEmojis.two: {
            outputEmbed(msg.channel, `Clicked on two`, {});
            break;
          }
          case answerEmojis.three: {
            outputEmbed(msg.channel, `Clicked on three`, {});
            break;
          }
          case answerEmojis.custom: {
            outputEmbed(msg.channel, `Clicked on tools`, {});
            break;
          }
        }
        await reaction.users.remove(msg.author.id);
      })
      .on("end", (_) => {
        messageReference.reactions.removeAll();
      });
  }
  async generateAndApplyFilter(msg: Message) {
    //generate ffmpeg args string
    this.client.player.filtersManager.generateFFMpegArgs();
    this.client.player.filterEnabled = true;
    //restart our audio stream but now with filters enabled
    await this.client.player.restartAudioStream(msg);
  }
}

module.exports = Filter;
