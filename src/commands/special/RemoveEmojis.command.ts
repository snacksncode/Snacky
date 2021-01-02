import { Message, CommandInterface, BotClient } from "discord.js";
import Command from "../../base/Command";
import { outputEmbed } from "../../utils/generic";

class ForceError extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "_remove_emojis",
      description:
        "Checks if server has Snacky's emojis and removes them if they are present because they are no longer needed",
      usage: `<prefix>_remove_emojis`,
      category: "Special",
      hidden: true,
    });
  }

  run(msg: Message) {
    let amountRemoved = 0;
    let failedToRemove = [];
    const emojisToRemove = ["snky_error", "snky_success"];
    const colors = this.client.config.colors;
    if (msg.guild.id === this.client.config.mainServerId) {
      outputEmbed(
        msg.channel,
        "You cannot remove emojis on this server because Snacky uses reference to them on all other servers.",
        {
          color: colors.warn,
        }
      );
      return;
    }
    emojisToRemove.forEach((emojiName) => {
      const resolvedEmojiObject = msg.guild.emojis.cache.find(
        (emoji) => emoji.name === emojiName
      );
      if (resolvedEmojiObject) {
        try {
          msg.guild.emojis.cache.delete(resolvedEmojiObject.id);
          amountRemoved++;
        } catch (err) {
          failedToRemove.push(emojiName);
          console.error(err);
        }
      }
    });
    if (failedToRemove.length === 0) {
      if (amountRemoved === 0) {
        outputEmbed(
          msg.channel,
          `This server doesn't have old Snacky's emojis. You're all good`,
          {
            color: colors.success,
          }
        );
      } else if (amountRemoved > 0) {
        outputEmbed(
          msg.channel,
          `Successfully removed unnecessary ${amountRemoved} Snacky's emoji${
            amountRemoved > 1 ? "s" : ""
          }`,
          {
            color: colors.success,
          }
        );
      }
    } else {
      outputEmbed(
        msg.channel,
        `I was unable to remove ${failedToRemove.toString} ${
          failedToRemove.length > 1 ? "emojis" : "emoji"
        }. Please do so manually, they are no longer needed for Snacky to properly function`,
        {
          color: colors.warn,
        }
      );
    }
  }
}

module.exports = ForceError;
