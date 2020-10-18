import { Message, TextChannel } from "discord.js";
import { prefix } from "../config";
import getRandomInt from "../utils/getRandomInt";
import outputEmbedMessage from "../utils/outputEmbedMessage";

interface diceObject {
  amount: number;
  dice: number;
}

const convertDices = (dices: string[]): diceObject[] => {
  let convertedDices: diceObject[] = [];
  dices.forEach((dice: string) => {
    let destructuredDice: number[] = dice
      .split("d")
      .map((dice) => Number(dice));
    convertedDices.push({
      amount: isNaN(destructuredDice.shift()) ? 1 : destructuredDice.shift(),
      dice: destructuredDice.shift(),
    });
  });
  return convertedDices;
};

const rollDice = (
  msg: Message,
  userInput: string,
  args: string[],
  channel: TextChannel
) => {
  // let randomChance: number = getRandomInt(1, 6);
  let dices: string[] = userInput.match(/\d?d\d{1,3}/g);
  let hasHelpFlag: boolean = !!userInput.match(/--help/g);
  if (hasHelpFlag) {
    outputEmbedMessage(`Help for the thing coming right up`, msg, "info");
    return;
  } else if (dices === null) {
    outputEmbedMessage(
      `Sorry I couldn't find any valid dices in your message. Try using **${prefix}rollDice --help**`,
      msg,
      "error"
    );
    return;
  }
  let dicesArray: diceObject[] = convertDices(dices);
  outputEmbedMessage(
    `Detected and converted dices: ${dicesArray}`,
    msg,
    "success"
  );
};
export default rollDice;
