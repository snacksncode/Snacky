import { Message } from "discord.js";
import { getQueue } from "../../utils/music/queueManager";

function stopCommand(msg: Message) {
  const guildQueue = getQueue(msg.guild.id, msg.client);
  if (!msg.member.voice.channel)
    return msg.channel.send("You have to be in a voice channel to stop the music.");
  if (!guildQueue) {
    return msg.channel.send("Bot is not currently playing music");
  }
  guildQueue.songs = [];
  guildQueue.isPlaying = false;
  guildQueue.connection.dispatcher.end();
}

export default stopCommand;
