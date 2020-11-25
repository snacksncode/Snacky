import { Command, Message } from "discord.js";
import { colors, prefix } from "../config";
import outputEmbed from "./outputEmbed";
import removePrefix from "./removePrefix";

function parseMessage(msg: Message) {
  //check if message contains a prefix, if not stop the execution
  const isCommand: boolean = msg.content.startsWith(prefix);
  if (!isCommand) return;
  //parse user input
  const userInput: string = removePrefix(msg.content.trim());
  const args: string[] = userInput.split(" ");
  const command: string = args
    .shift()
    .replace(/\||`|~|\*|_|\"/g, "")
    .replace(/\s{2,}/g, " ")
    .toLowerCase();
  //check if command object exist
  if (!command) {
    msg.channel.send(
      "I'm a lazy ass and I need to add the support for this. Probably will output help"
    );
  }
  const commandObject: Command =
    msg.client.commands.get(command) ||
    msg.client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(command));
  //if it doesn't tell the user that it doesn't
  if (!commandObject) {
    return outputEmbed(msg.channel, `Command \`${command}\` doesn't exist`, {
      title: "Wrong command",
      color: colors.error,
      author: msg.author,
    });
  }
  //execute the requested command
  try {
    commandObject.exec(msg);
  } catch (err) {
    console.error(err.message);
    return outputEmbed(msg.channel, `An error occured during command execution.`, {
      title: "Runtime Error",
      color: colors.error,
      author: msg.author,
    });
  }
}

export default parseMessage;
