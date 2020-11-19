import { Command, Message } from "discord.js";
import { colors, prefix } from "../config";
import outputEmbed from "./outputEmbed";
import removePrefix from "./removePrefix";

function parseMessage(msg: Message) {
  //check if message contains a prefix, if not stop the execution
  const isCommand: boolean = msg.content.startsWith(prefix);
  if (!isCommand) return;
  //parse user input
  const userInput: string = removePrefix(msg.content);
  const args: string[] = userInput.split(" ");
  const command: string = args.shift().toLowerCase();
  //check if command object exists
  const commandObject: Command =
    msg.client.commands.get(command) ||
    msg.client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(command));
  //if it doesn't tell the user that it doesn't
  if (!commandObject) {
    return outputEmbed(
      msg.channel,
      `Command \`${command}\` doesn't exist`,
      colors.error,
      "Wrong command"
    );
  }
  //execute the requested command
  try {
    commandObject.exec(msg);
  } catch (_) {
    return outputEmbed(
      msg.channel,
      `An error occured during command execution.`,
      colors.error,
      `Error`
    );
  }
}

export default parseMessage;
