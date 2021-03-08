import { Message, CommandInterface, BotClient } from "discord.js";
import Command from "../../base/Command";
import { formatMs, outputEmbed, removePrefix } from "../../utils/generic";

class Rewind extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "rewind",
      aliases: ["rw"],
      description: "Allows you to go back and forth in currently playing song",
      usage: "<prefix>rewind [+|-]<number>",
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
      if (!guildQueue.isPlaying) {
        throw "Bot is currently not playing any audio";
      }
      if (guildQueue.songs[0].isLive) {
        throw "You cannot skip around in livestreams";
      }
    } catch (errMsg) {
      return outputEmbed(msg.channel, errMsg, {
        color: colors.warn,
      });
    }
    const userInput = removePrefix(msg.content, this.client.config.prefix);
    const matchingAmountRegex = /(\+|-)(\s?)*(\d{1,})/;
    const matchedArray = userInput.match(matchingAmountRegex);
    const sign = matchedArray?.[1];
    const amount = matchedArray?.[3];
    if (!sign || !amount) {
      outputEmbed(msg.channel, `Incorrect parameters`, {
        color: colors.error,
      });
      return;
    }
    const currentSpeedMod = this.client.player.filtersManager.detectFilterSpeedMod(guildQueue);
    const currentSeek = this.client.player.getDispatcherStreamTime(guildQueue, currentSpeedMod);
    let newSeek = 0;
    switch (sign) {
      case "+":
        newSeek = currentSeek + Number(amount);
        break;
      case "-":
        newSeek = currentSeek - Number(amount);
        break;
    }
    outputEmbed(
      msg.channel,
      `${sign === "+" ? "Forwarding" : "Rewinding"} by ${formatMs(Number(amount) * 1000)}`,
      {
        color: colors.success,
      }
    );
    await this.client.player.restartAudioStream(msg, {
      customSeek: newSeek,
      applyFilter: !!guildQueue.filterArgs,
    });
  }
}

module.exports = Rewind;
