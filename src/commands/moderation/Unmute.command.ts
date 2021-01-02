import { Message, CommandInterface, BotClient } from "discord.js";
import Command from "../../base/Command";
import { outputEmbed } from "../../utils/generic";

class Unmute extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "unmute",
      description: "Removes 'muted' role to mentioned user(s)",
      usage: `<prefix>unmute [user]`,
      category: "Moderation",
      permissions: ["ADMINISTRATOR"],
    });
  }

  async run(msg: Message) {
    if (msg.mentions.members.size < 1) {
      return outputEmbed(msg.channel, `Mention a user that you want to unmute`, {
        color: this.client.config.colors.error,
        title: "Wrong command usage",
      });
    }
    let mutedRole = msg.guild.roles.cache.find((role) => role.name === "muted");
    msg.mentions.members.each((member) => {
      let userIsMuted: boolean = member.roles.cache.some((role) => role.name === "muted");
      if (!userIsMuted) {
        return outputEmbed(msg.channel, `Member ${member} is not currently muted.`, {
          color: this.client.config.colors.warn,
        });
      }
      member.roles
        .remove(mutedRole)
        .then((member) => {
          outputEmbed(msg.channel, `Member ${member} is now unmuted.`, {
            color: this.client.config.colors.success,
          });
        })
        .catch((err) => {
          outputEmbed(msg.channel, `Couldn't unmute ${member}`, {
            color: this.client.config.colors.error,
          });
          console.error(err);
        });
    });
  }
}

module.exports = Unmute;
