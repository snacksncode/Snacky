import { Message, TextChannel } from "discord.js";
import { prefix } from "../config";
import {
  avatarCommand,
  clearCommand,
  cumCommand,
  helpCommand,
  pingCommand,
  rollDiceCommand,
} from "../commands";
import outputEmbed from "./outputEmbed";
import uptimeCommand from "../commands/base/uptime";

function parseMessage(msg: Message, currentChannel: TextChannel): void {
  //check if message contains a prefix, if not stop execution
  const isCommand: boolean = msg.content.startsWith(prefix);
  if (!isCommand) return;

  //get currentChannel and check if user has put anything after a prefix if not send user an error
  const userInput: string = msg.content.substr(prefix.length);
  const args: string[] = userInput.split(" ");
  const command: string = args.shift().toLowerCase();

  if (userInput.length === 0) {
    helpCommand(currentChannel, msg, userInput);
    return;
  }

  switch (command) {
    case "help": {
      helpCommand(currentChannel, msg, userInput);
      break;
    }
    case "ping": {
      pingCommand(msg, currentChannel);
      break;
    }
    case "uptime": {
      uptimeCommand(msg);
      break;
    }
    case "cum": {
      cumCommand(msg);
      break;
    }
    case "avatar": {
      avatarCommand(msg, msg.mentions.users);
      break;
    }
    case "clear": {
      clearCommand(msg, userInput, msg.mentions.users, currentChannel);
      break;
    }
    case "rolldice": {
      rollDiceCommand(msg, userInput);
      break;
    }
    default: {
      outputEmbed("Command not found", msg, "error");
      break;
    }
  }
}

export default parseMessage;
