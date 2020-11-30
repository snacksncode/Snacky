import { GuildMember, Message, Role } from "discord.js";
import { colors } from "../../config";
import outputEmbed from "../../utils/outputEmbed";
import stateReact from "../../utils/stateReact";

function unmuteCommand(msg: Message) {
  if (msg.mentions.members.size < 1) {
    if (!!!msg.content.match(/<@\d{1,}>/g)) {
      stateReact(msg, "error");
      return outputEmbed(msg.channel, "You've mentioned someone not from this server", {
        color: colors.error,
        title: `Invalid user mention.`,
      });
    }
    return outputEmbed(msg.channel, `Mention a user that you want to unmute`, {
      color: colors.error,
      title: "Wrong command usage",
    });
  }
  let mutedRole: Role = msg.guild.roles.cache.find((role) => role.name === "muted");
  msg.mentions.members.each((member: GuildMember) => {
    let userIsMuted: boolean = member.roles.cache.some((role) => role.name === "muted");
    if (!userIsMuted) {
      return outputEmbed(msg.channel, `Member ${member.user} is not currently muted.`, {
        color: colors.warn,

        title: "Invalid usage",
      });
    }
    member.roles
      .remove(mutedRole)
      .then((member) => {
        stateReact(msg, "success");
        outputEmbed(msg.channel, `Member ${member.user} is now unmuted.`, {
          color: colors.success,

          title: "Success",
        });
      })
      .catch((err) => {
        stateReact(msg, "error");
        outputEmbed(msg.channel, `Couldn't unmute ${member.user}`, {
          color: colors.error,

          title: "Runtime Error",
        });
        console.error(err);
      });
  });
}
export default unmuteCommand;
