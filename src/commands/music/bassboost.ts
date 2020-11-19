import { Message } from "discord.js";
import { getQueue } from "../../utils/music/queueManager";

function bassboostCommand(msg: Message) {
  const guildQueue = getQueue(msg.guild.id, msg.client);
  //toggle the value on current player
  guildQueue.bassboost = !guildQueue.bassboost;
  const bassboosted = guildQueue.bassboost;
  guildQueue.connection.dispatcher.setVolume(bassboosted ? 10.0 : 1.0);
}

export default bassboostCommand;
