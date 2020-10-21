import { Message, TextChannel } from "discord.js";
import { prefix } from "../config";
import clearCommand from "../commands/clear";
import helpCommand from "../commands/help";
import pingCommand from "../commands/ping";
import cumCommand from "../commands/cum";
import rollDice from "../commands/rollDice";
import avatarCommand from "../commands/avatar";
import outputEmbedMessage from "./outputEmbedMessage";

const checkForPrefix = (input: string): boolean => {
  return input.startsWith(prefix);
};

const parseMessage = (msg: Message, currentChannel: TextChannel): void => {
  //check if message contains a prefix, if not stop execution
  const isCommand: boolean = checkForPrefix(msg.content);
  if (!isCommand) return;

  //get currentChannel and check if user has put anything after a prefix if not send user an error
  const inputWithoutPrefix: string = msg.content.substr(prefix.length);
  const userInput: string[] = inputWithoutPrefix.split(" ");
  const command: string = userInput.shift().toLowerCase();

  if (inputWithoutPrefix.length === 0) {
    helpCommand(currentChannel);
    return;
  }

  switch (command) {
    case "help": {
      helpCommand(currentChannel);
      break;
    }
    case "ping": {
      pingCommand(msg, currentChannel);
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
      clearCommand(msg, inputWithoutPrefix, currentChannel);
      break;
    }
    case "rolldice": {
      rollDice(msg, inputWithoutPrefix);
      break;
    }
    default: {
      outputEmbedMessage("Command not found", msg, "error");
      break;
    }
  }
};

export default parseMessage;
