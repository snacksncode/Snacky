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

  // switch (command) {
  //   case "help": {
  //     helpCommand(currentChannel, msg, userInput);
  //     break;
  //   }
  //   case "ping": {
  //     pingCommand(msg, currentChannel);
  //     break;
  //   }
  //   case "uptime": {
  //     uptimeCommand(msg);
  //     break;
  //   }
  //   case "mute": {
  //     muteCommand(msg);
  //     break;
  //   }
  //   case "unmute": {
  //     unmuteCommand(msg);
  //     break;
  //   }
  //   case "uptime": {
  //     uptimeCommand(msg);
  //     break;
  //   }
  //   case "cum": {
  //     cumCommand(msg);
  //     break;
  //   }
  //   case "avatar": {
  //     avatarCommand(msg, msg.mentions.users);
  //     break;
  //   }
  //   case "clear": {
  //     clearCommand(msg, userInput, msg.mentions.users, currentChannel);
  //     break;
  //   }
  //   case "rolldice": {
  //     rollDiceCommand(msg, userInput);
  //     break;
  //   }
  //   default: {
  //     outputEmbed(msg.channel, "Command not found", colors.error);
  //     break;
  //   }
  // }
}

export default parseMessage;
