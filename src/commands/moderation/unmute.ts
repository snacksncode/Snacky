import { GuildMember, Message, Role } from "discord.js";
import { colors } from "../../config";
import outputEmbed from "../../utils/outputEmbed";

function unmuteCommand(msg: Message) {
  if (msg.mentions.members.size < 1) {
    return outputEmbed(
      msg.channel,
      "",
      colors.error,
      `Mention a user that you want to unmute`
    );
  }
  let mutedRole: Role = msg.guild.roles.cache.find((role) => role.name === "muted");
  msg.mentions.members.each((member: GuildMember) => {
    let userIsMuted: boolean = member.roles.cache.some((role) => role.name === "muted");
    if (!userIsMuted) {
      return outputEmbed(
        msg.channel,
        "",
        colors.warn,
        `Member ${member.user.tag} is not currently muted.`
      );
    }
    member.roles
      .remove(mutedRole)
      .then((member) => {
        outputEmbed(
          msg.channel,
          "",
          colors.success,
          `Member ${member.user.tag} is now unmuted.`
        );
      })
      .catch((err) => {
        outputEmbed(msg.channel, "", colors.error, `Couldn't unmute ${member.user.tag}`);
        console.error(err);
      });
  });
}
export default unmuteCommand;
