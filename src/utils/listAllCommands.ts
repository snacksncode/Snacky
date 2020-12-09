import { Collection, Command } from "discord.js";

function listAllCommands(commands: Collection<string, Command>): string {
  let outputString: string = "";
  commands.each((cmd: Command, key: string) => {
    if (cmd.hidden) return;
    outputString += `\`${cmd.commandName}\`${key === commands.lastKey() ? "" : ", "}`;
  });
  return outputString;
}

export default listAllCommands;
