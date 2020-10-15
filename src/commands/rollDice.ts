import { Message, TextChannel } from "discord.js";
import { prefix } from "../config";
import getRandomInt from "../utils/getRandomInt";
import outputEmbedMessage from "../utils/outputEmbedMessage";

const rollDice = (msg: Message, userInput: string, args: string[], channel: TextChannel) => {
  // let randomChance: number = getRandomInt(1, 6);
  let dices: string[] = userInput.match(/\d?d\d{1,3}/g);
  let hasHelpFlag: boolean = !!userInput.match(/--help/g);
  if (hasHelpFlag) {
    outputEmbedMessage(
      `Help for the thing coming right up`,
      msg,
      'info'
    )
    return;
  } else if (dices === null) {
    outputEmbedMessage(
      `Sorry I couldn't find any valid dices in your message. Try using **${prefix}rollDice --help**`,
      msg,
      'error'
    )
    return;
  }
  outputEmbedMessage(
    `Here are what dices I've detected: ${dices}`,
    msg,
    'success'
  )
}
export default rollDice;