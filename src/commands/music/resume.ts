import { Message } from "discord.js";
import { getQueue } from "../../utils/music/queueManager";

function resumeCommand(msg: Message) {
  const guildQueue = getQueue(msg.guild.id, msg.client);
  if (msg.member.voice.channel.id !== guildQueue.voiceChannel.id) {
    return msg.channel.send("You're not in the same voice chat as Snacky.");
  }
  if (!guildQueue) {
    return msg.channel.send("Bot is not currently in voicechat");
  }
  if (!guildQueue.connection.dispatcher.paused) {
    return msg.channel.send("Playback is not currently paused");
  }
  if (!guildQueue.songs[0]) {
    return msg.channel.send("There's no songs in queue");
  }
  if (!guildQueue.isPlaying) {
    guildQueue.isPlaying = true;
    guildQueue.connection.dispatcher.resume();
  }
}

export default resumeCommand;
