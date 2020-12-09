import { Message } from "discord.js";
import { colors } from "../../config";
import { getQueue } from "../../utils/music/queueManager";
import outputEmbed from "../../utils/outputEmbed";

function bassboostCommand(msg: Message) {
  const guildQueue = getQueue(msg.guild.id, msg.client);
  //toggle the value on current player
  guildQueue.bassboost = !guildQueue.bassboost;
  const bassboosted = guildQueue.bassboost;
  guildQueue.connection.dispatcher.setVolume(bassboosted ? 10.0 : 1.0);
  outputEmbed(
    msg.channel,
    bassboosted ? `Ah yes good 'ol earrape... Enjoy lmao` : `Earrape mode has been disabled`,
    {
      color: colors.success,
      title: "",
    }
  );
}

export default bassboostCommand;
