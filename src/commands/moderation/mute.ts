import { GuildMember, Message, Role } from "discord.js";
import { colors } from "../../config";
import checkForPermissions from "../../utils/checkForPermissions";
import outputEmbed from "../../utils/outputEmbed";
import stateReact from "../../utils/stateReact";

function muteCommand(msg: Message) {
  if (msg.mentions.members.size < 1) {
    if (!!!msg.content.match(/<@\d{1,}>/g)) {
      stateReact(msg, "error");
      return outputEmbed(msg.channel, "You've mentioned someone not from this server", {
        color: colors.error,
        title: `Invalid user mention.`,
        author: msg.author,
      });
    }
    stateReact(msg, "error");
    return outputEmbed(msg.channel, "", {
      color: colors.error,
      title: `Mention a user that you want to mute`,
      author: msg.author,
    });
  }
  let mutedRole: Role = msg.guild.roles.cache.find((role) => role.name === "muted");
  msg.mentions.members.each((member: GuildMember) => {
    if (checkForPermissions(["ADMINISTRATOR"], member)) {
      return outputEmbed(
        msg.channel,
        `<@${member.id}> has administrator role on this server. Muting will have no effect`,
        {
          color: colors.warn,
          title: `You cannot mute admins.`,
          author: msg.author,
        }
      );
    }
    let userIsMuted: boolean = member.roles.cache.some((role) => role.name === "muted");
    if (userIsMuted) {
      return outputEmbed(msg.channel, "", {
        color: colors.warn,
        title: `Member ${member.user.tag} is already muted.`,
        author: msg.author,
      });
    }
    member.roles
      .add(mutedRole)
      .then((member) => {
        stateReact(msg, "success");
        outputEmbed(msg.channel, `Member ${member.user} is now muted.`, {
          color: colors.success,
          author: msg.author,
          title: "Success",
        });
      })
      .catch((err) => {
        stateReact(msg, "error");
        outputEmbed(msg.channel, `Couldn't mute ${member.user.tag}`, {
          color: colors.error,
          title: "An error occured",
          author: msg.author,
        });
        console.error(err);
      });
  });
}
export default muteCommand;
