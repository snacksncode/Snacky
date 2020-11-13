import { GuildMember, Message, Role } from "discord.js";
import { colors } from "../../config";
import checkForPermissions from "../../utils/checkForPermissions";
import outputEmbed from "../../utils/outputEmbed";
import stateReact from "../../utils/stateReact";

function muteCommand(msg: Message) {
  if (msg.mentions.members.size < 1) {
    if (!!!msg.content.match(/<@\d{1,}>/g)) {
      stateReact(msg, "error");
      return outputEmbed(
        msg.channel,
        "You've mentioned someone not from this server",
        colors.error,
        `Invalid user mention.`
      );
    }
    stateReact(msg, "error");
    return outputEmbed(msg.channel, "", colors.error, `Mention a user that you want to mute`);
  }
  let mutedRole: Role = msg.guild.roles.cache.find((role) => role.name === "muted");
  msg.mentions.members.each((member: GuildMember) => {
    if (checkForPermissions(["ADMINISTRATOR"], member)) {
      return outputEmbed(
        msg.channel,
        `<@${member.id}> has administrator role on this server. Muting will have no effect`,
        colors.warn,
        `You cannot mute admins.`
      );
    }
    let userIsMuted: boolean = member.roles.cache.some((role) => role.name === "muted");
    if (userIsMuted) {
      return outputEmbed(
        msg.channel,
        "",
        colors.warn,
        `Member ${member.user.tag} is already muted.`
      );
    }
    member.roles
      .add(mutedRole)
      .then((member) => {
        stateReact(msg, "success");
        outputEmbed(msg.channel, "", colors.success, `Member ${member.user.tag} is now muted.`);
      })
      .catch((err) => {
        stateReact(msg, "error");
        outputEmbed(msg.channel, "", colors.error, `Couldn't mute ${member.user.tag}`);
        console.error(err);
      });
  });
}
export default muteCommand;
