import { Message, TextChannel } from "discord.js";
import { prefix } from "../config";
import getRandomInt from "../utils/getRandomInt";
import outputEmbedMessage from "../utils/outputEmbedMessage";

interface diceObject {
  timesToRoll: number;
  diceToRoll: number;
}

//helper functions
const convertDices = (dices: string[]): diceObject[] => {
  let convertedDices: diceObject[] = [];
  dices.forEach((dice: string) => {
    let destructuredDice: number[] = dice
      .split("d")
      .map((dice) => Number(dice));
    if (destructuredDice[0] === 0) {
      //their input is something like d6 (maybe 0d6). Treat as 1d6
      convertedDices.push({
        timesToRoll: 1,
        diceToRoll: destructuredDice[1],
      });
    } else {
      convertedDices.push({
        //their input is something like 2d6.
        timesToRoll: destructuredDice[0],
        diceToRoll: destructuredDice[1],
      });
    }
  });
  return convertedDices;
};

const rollDices = (dices: diceObject[]): number => {
  let sum: number = 0;
  dices.forEach((dice: diceObject) => {
    for (let timesRolled = 0; timesRolled < dice.timesToRoll; timesRolled++) {
      let roll: number = getRandomInt(1, dice.diceToRoll);
      sum += roll;
    }
  });
  return sum;
};

//actual command function
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
  let rolledSum: number = rollDices(dicesArray);

  console.log(dicesArray, dices, rolledSum);
  outputEmbedMessage(
    `Your request: ${dices}. Your roll: ${rolledSum}`,
    msg,
    "success"
  );
};
export default rollDice;
