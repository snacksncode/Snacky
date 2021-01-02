import { Message, CommandInterface, BotClient } from "discord.js";
import Command from "../../base/Command";
import { outputEmbed } from "../../utils/generic";

class Mute extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "mute",
      description: "Adds 'muted' role to mentioned user(s)",
      usage: `<prefix>mute [user]`,
      category: "Moderation",
      permissions: ["ADMINISTRATOR"],
    });
  }

  async run(msg: Message) {
    if (msg.mentions.members.size < 1) {
      return outputEmbed(msg.channel, `Mention a user that you want to mute`, {
        color: this.client.config.colors.error,
      });
    }
    let mutedRole = msg.guild.roles.cache.find((role) => role.name === "muted");
    msg.mentions.members.each((member) => {
      //make util function for permissions checking
      if (member.hasPermission("ADMINISTRATOR")) {
        return outputEmbed(
          msg.channel,
          `${member} has administrator role on this server. Muting will have no effect`,
          {
            color: this.client.config.colors.warn,
          }
        );
      }
      let userIsMuted: boolean = member.roles.cache.some((role) => role.name === "muted");
      if (userIsMuted) {
        return outputEmbed(msg.channel, `Member ${member} is already muted.`, {
          color: this.client.config.colors.warn,
        });
      }
      member.roles
        .add(mutedRole)
        .then((member) => {
          outputEmbed(msg.channel, `Member ${member} is now muted.`, {
            color: this.client.config.colors.success,
          });
        })
        .catch((err) => {
          outputEmbed(msg.channel, `Couldn't mute ${member}`, {
            color: this.client.config.colors.error,
          });
          console.error(err);
        });
    });
  }
}

module.exports = Mute;
