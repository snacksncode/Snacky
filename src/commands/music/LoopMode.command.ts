import {
  Message,
  CommandInterface,
  BotClient,
  MessageReaction,
  User,
  GuildMusicQueue,
  MessageEmbed,
} from "discord.js";
import Command from "../../base/Command";
import { outputEmbed, removePrefix } from "../../utils/generic";

class Earrape extends Command implements CommandInterface {
  guildQueue: GuildMusicQueue;
  constructor(client: BotClient) {
    super(client, {
      name: "loop",
      description:
        "Toggles looping of currently playing song | Will later support looping of whole queue",
      usage: "<prefix>loop",
      category: "Music",
    });
  }
  async run(msg: Message) {
    this.guildQueue = this.client.player.getQueue(msg.guild.id);
    const colors = this.client.config.colors;
    try {
      if (!this.guildQueue) {
        throw "Bot is not currently in voicechat";
      }
      if (!msg.member.voice) {
        throw "You're not currently in voice channel";
      }
      if (msg.member.voice.channel.id !== this.guildQueue.voiceChannel.id) {
        throw "You're not in the same voice chat as Snacky.";
      }
      if (this.guildQueue.songs.length === 0) {
        throw "Queue is empty";
      }
    } catch (errMsg) {
      return outputEmbed(msg.channel, errMsg, {
        color: colors.warn,
      });
    }
    //toggle the value on current player
    const userInput = removePrefix(msg.content.trim(), this.client.config.prefix);
    const args = userInput.split(" ");
    //discard command name
    args.shift();

    if (args.length < 1) {
      //no args were provided, show "help"
      const [messageReference, embedReference] = await outputEmbed(
        msg.channel,
        `You didn't specify which mode do you want to enable. You can use \`s!loop song\`, \`s!loop queue\` or \`s!loop off\` to specify which mode do you want to enable. You can also use emojis below this message to activate mode that you want`,
        {
          color: colors.info,
          title: "Looping settings",
          fields: [
            { name: ":repeat_one: Loop Song", value: "Play song again and again", inline: true },
            {
              name: ":repeat: Loop Queue",
              value: "After a song ends it'll be placed at the end queue",
              inline: true,
            },
            { name: ":no_entry: Turn Off", value: "Disable looping", inline: true },
            { name: "Current looping setting", value: this.getLoopingSettingString() },
          ],
        }
      );
      await messageReference.react("🔂");
      await messageReference.react("🔁");
      await messageReference.react("⛔");

      const reactionCollectorIdleTimout = 60000;

      const queueControlsFilter = (reaction: MessageReaction, user: User) => {
        return ["🔂", "🔁", "⛔"].includes(reaction.emoji.name) && msg.author.id === user.id;
      };

      const collectorInstance = messageReference.createReactionCollector(queueControlsFilter, {
        idle: reactionCollectorIdleTimout,
      });

      collectorInstance
        .on("collect", async (reaction: MessageReaction) => {
          switch (reaction.emoji.name) {
            case "🔂": {
              this.enableSongLooping(msg);
              break;
            }
            case "🔁": {
              this.enableQueueLooping(msg);
              break;
            }
            case "⛔": {
              this.disableLooping(msg);
              break;
            }
          }
          this.updateLoopEmbed(messageReference, embedReference);
          await reaction.users.remove(msg.author.id);
        })
        .on("end", (_) => {
          messageReference.reactions.removeAll();
        });
    } else {
      const selectedMode = args[0];
      if (!["off", "song", "queue"].includes(selectedMode)) {
        outputEmbed(
          msg.channel,
          `Invalid argument. You can set loop mode to only: \`off\`, \`queue\` and \`song\``,
          {
            color: colors.error,
          }
        );
        return;
      }
      switch (selectedMode) {
        case "off":
          this.disableLooping(msg);
          break;
        case "queue":
          this.enableQueueLooping(msg);
          break;
        case "song":
          this.enableSongLooping(msg);
          break;
        default:
          console.log("it brokey");
          break;
      }
    }
  }
  updateLoopEmbed(messageReference: Message, embedRef: MessageEmbed) {
    embedRef.fields[3].value = this.getLoopingSettingString();
    messageReference.edit(embedRef);
  }
  enableQueueLooping(msg: Message) {
    this.guildQueue.loopMode = "queue";
    outputEmbed(msg.channel, `Queue will now loop :3`, {
      color: this.client.config.colors.success,
    });
  }
  getLoopingSettingString() {
    switch (this.guildQueue.loopMode) {
      case "off":
        return "Looping is off";
      case "queue":
        return "Queue is looping";
      case "song":
        return "Song is looping";
      default:
        return "It brokey";
    }
  }
  enableSongLooping(msg: Message) {
    this.guildQueue.loopMode = "song";
    const song = this.guildQueue.songs[0];
    outputEmbed(msg.channel, `**[${song.title}](${this.guildQueue.songs[0].url})** will now loop`, {
      color: this.client.config.colors.success,
    });
  }
  disableLooping(msg: Message) {
    this.guildQueue.loopMode = "off";
    outputEmbed(msg.channel, `Looping is disabled`, {
      color: this.client.config.colors.success,
    });
  }
}

module.exports = Earrape;
