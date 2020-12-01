import { Message, MessageReaction, User } from "discord.js";
import { colors } from "../../config";
import generateQueueEmbeds from "../../utils/music/generateQueueEmbeds";
import { getQueue } from "../../utils/music/queueManager";
import outputEmbed from "../../utils/outputEmbed";

async function queueCommand(msg: Message) {
  const guildQueue = getQueue(msg.guild.id, msg.client);
  const songsPerPage = 5;
  const reactionCollectorIdleTimout = 60000;
  if (!guildQueue) {
    return outputEmbed(msg.channel, `There is no songs in queue`, {
      color: colors.warn,
      title: "",
    });
  }
  const filter = (reaction: MessageReaction, user: User) => {
    return ["⬅️", "⏹", "➡️"].includes(reaction.emoji.name) && msg.author.id === user.id;
  };
  let currentPageIndex = 0;
  const queueEmbeds = generateQueueEmbeds(guildQueue.songs, songsPerPage);

  const messageObject = await msg.channel.send(queueEmbeds[currentPageIndex]);
  if (queueEmbeds.length > 1) {
    await messageObject.react("⬅️");
    await messageObject.react("⏹");
    await messageObject.react("➡️");
    const collectorInstance = messageObject.createReactionCollector(filter, {
      idle: reactionCollectorIdleTimout,
    });
    collectorInstance
      .on("collect", async (reaction: MessageReaction) => {
        switch (reaction.emoji.name) {
          case "⬅️": {
            currentPageIndex--;
            if (currentPageIndex < 0) {
              currentPageIndex = 0;
            }
            messageObject.edit(queueEmbeds[currentPageIndex]);
            break;
          }
          case "➡️": {
            currentPageIndex++;
            if (currentPageIndex >= queueEmbeds.length) {
              currentPageIndex = queueEmbeds.length - 1;
            }

            messageObject.edit(queueEmbeds[currentPageIndex]);
            break;
          }
          case "⏹": {
            messageObject.reactions.removeAll();
            collectorInstance.stop();
            break;
          }
        }
        await reaction.users.remove(msg.author.id);
      })
      .on("end", (_) => {
        messageObject.reactions.removeAll();
      });
  }
}

export default queueCommand;
