import { Message } from "discord.js";
import { colors, prefix } from "../../config";
import getRandomInt from "../../utils/getRandomInt";
import outputEmbed from "../../utils/outputEmbed";

interface diceObject {
  timesToRoll: number;
  diceToRoll: number;
}

//helper functions
const convertDices = (dices: string[]): diceObject[] => {
  let convertedDices: diceObject[] = [];
  dices.forEach((dice: string) => {
    let destructuredDice: number[] = dice.split("d").map((dice) => Number(dice));
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

//command itself
const rollDices = (dices: diceObject[]): number[] => {
  let rolls: number[] = [];
  dices.forEach((dice: diceObject) => {
    for (let timesRolled = 0; timesRolled < dice.timesToRoll; timesRolled++) {
      let roll: number = getRandomInt(1, dice.diceToRoll);
      rolls.push(roll);
    }
  });
  return rolls;
};

//actual command function
const rollDiceCommand = (msg: Message, userInput: string): void => {
  let hasHelpFlag: boolean = !!userInput.match(/--help/g);
  let diceRegex: RegExp = /\d{1,2}?d\d{1,}/g;
  let extractedDices: string[] | null = userInput.match(diceRegex);
  //trigger help flag
  if (hasHelpFlag) {
    outputEmbed(msg.channel, `Help for the thing coming right up`, colors.info);
    return;
  } else if (extractedDices === null) {
    //if no dices matched
    outputEmbed(
      msg.channel,
      `Sorry I couldn't find any valid dices in your message. Try using **${prefix}rollDice --help**`,
      colors.error
    );
    return;
  }
  let diceObjectArray: diceObject[] = convertDices(extractedDices);

  let diceRolls: number[] = rollDices(diceObjectArray);
  let calculatedSum: number = diceRolls.reduce((acc: number, cur: number) => {
    return acc + cur;
  }, 0);

  outputEmbed(msg.channel, "", colors.info, `Rolling: **${extractedDices}**`, [
    { name: "You've rolled", value: `${diceRolls}`, inline: true },
    { name: "\u200B", value: "\u200B", inline: true },
    { name: "Total", value: `${calculatedSum}`, inline: true },
    { name: "Requsted by", value: msg.author },
  ]);
};
export default rollDiceCommand;
