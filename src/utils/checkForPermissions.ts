import { GuildMember, PermissionString } from "discord.js";

const checkForPermissions = (permissionsArray: PermissionString[], member: GuildMember): boolean => {
  let hasPermission: boolean = false;
  permissionsArray.forEach(permission => {
    if (member.hasPermission(permission)) {
      hasPermission = true;
    } else {
      hasPermission = false;
    }
  })
  return hasPermission;
}
export default checkForPermissions;