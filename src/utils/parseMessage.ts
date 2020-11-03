import { Command, Message } from "discord.js";
import { colors, prefix } from "../config";
import outputEmbed from "./outputEmbed";
import removePrefix from "./removePrefix";

function parseMessage(msg: Message) {
  //check if message contains a prefix, if not stop the execution
  const isCommand: boolean = msg.content.startsWith(prefix);
  if (!isCommand) return;

  const userInput: string = removePrefix(msg.content);
  const args: string[] = userInput.split(" ");
  const command: string = args.shift().toLowerCase();

  const commandObject: Command =
    msg.client.commands.get(command) ||
    msg.client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(command));

  if (!commandObject) {
    return outputEmbed(
      msg.channel,
      `Command \`${command}\` doesn't exist`,
      colors.error,
      "Wrong command"
    );
  }

  commandObject.exec(msg);
}

export default parseMessage;
