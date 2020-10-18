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
    if (destructuredDice[0] === 0) {
      //their input is something like d6 (maybe 0d6). Treat as 1d6
      convertedDices.push({
        amount: 1,
        dice: destructuredDice.shift(),
      });
    } else {
      convertedDices.push({
        //their input is something like 2d6.
        amount: destructuredDice.shift(),
        dice: destructuredDice.shift(),
      });
    }
  });
  return convertedDices;
};

const rollDice = (
  msg: Message,
  userInput: string,
  args: string[],
  channel: TextChannel
) => {
  // let randomChance: number  Treat as 1d6= getRandomInt(1, 6);
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
  let rolledSum: number = 0;

  dicesArray.forEach((dice: diceObject) => {
    let amountToRoll = new Array(dice.amount);
    amountToRoll.forEach((_) => {
      let roll = getRandomInt(1, dice.dice);
      rolledSum += roll;
    });
  });

  console.log(dicesArray, dices, rolledSum);
  outputEmbedMessage(`Check your console`, msg, "success");
};
export default rollDice;
