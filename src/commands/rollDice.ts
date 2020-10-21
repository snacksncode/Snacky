import { Message } from "discord.js";
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

const mergeArrays = (arr: any[], secondArr: any[]): any[] => {
  let longerArray = arr.length > secondArr.length ? arr : secondArr;
  let shorterArray = arr.length > secondArr.length ? secondArr : arr;
  let combinedArray = longerArray.map((item, index: number) => {
    //any[] cause there's an error in TS
    return [item, shorterArray[index]]
      .filter((item) => item !== undefined)
      .flat()
      .join("");
  });
  return combinedArray;
};

const rollDices = (dices: diceObject[], emptiedString: string[]): string[] => {
  console.log(dices);
  let rolls: string[] = [];
  dices.forEach((dice: diceObject) => {
    console.log(dice);
    for (let timesRolled = 0; timesRolled < dice.timesToRoll; timesRolled++) {
      let roll: number = getRandomInt(1, dice.diceToRoll);
      rolls.push(roll.toString());
      if (timesRolled > 0) {
        //This is kinda a quickfix. If I don't push + to the array with the 'operators'
        //in eval() function I'm gonna have "5 4" and not "5 + 4"
        emptiedString.push("+");
      }
    }
  });
  return rolls;
};

//actual command function
const rollDice = (msg: Message, userInput: string): void => {
  let hasHelpFlag: boolean = !!userInput.match(/--help/g);
  let diceRegex: RegExp = /\d?d\d{1,}/g;
  let extractedDicesArray: string[] | null = userInput.match(diceRegex);
  let args: string = userInput.substr(8);
  let emptiedString: string[] = args
    .split(diceRegex)
    .filter((item) => item !== "");
  //trigger help flag
  if (hasHelpFlag) {
    outputEmbedMessage(`Help for the thing coming right up`, msg, "info");
    return;
  } else if (extractedDicesArray === null) {
    //if no dices matched
    outputEmbedMessage(
      `Sorry I couldn't find any valid dices in your message. Try using **${prefix}rollDice --help**`,
      msg,
      "error"
    );
    return;
  }
  let diceObjectArray: diceObject[] = convertDices(extractedDicesArray);

  let diceRolls: string[] = rollDices(diceObjectArray, emptiedString);
  let combinedArray: string[] = mergeArrays(diceRolls, emptiedString);
  let reconstructedInput: string = combinedArray.join("");
  let calculatedSum: number = eval(reconstructedInput);

  outputEmbedMessage(
    `Requested: **${args}** | ${
      diceRolls.length > 1 ? "Rolls" : "Roll"
    }: **${diceRolls}** ${
      diceRolls.length > 1 ? `| Final output: **${calculatedSum}**` : ""
    }`,
    msg,
    "success",
    "Rolls"
  );
};
export default rollDice;
