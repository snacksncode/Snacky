import { Message, CommandInterface, BotClient } from "discord.js";
import Command from "../../base/Command";
import { removePrefix, outputEmbed, getRandomInt } from "../../utils/generic";

interface diceObject {
  timesToRoll: number;
  diceToRoll: number;
}

class Roll extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "roll",
      description: "Rolls dice for you",
      usage: "<prefix>roll [dice]",
      aliases: ["rolldice", "dice"],
      example: `s!roll 2d6 d10`,
      category: "Fun",
    });
  }

  rollDices(dices: diceObject[]): number[] {
    let rolls: number[] = [];
    dices.forEach((dice: diceObject) => {
      for (let timesRolled = 0; timesRolled < dice.timesToRoll; timesRolled++) {
        let roll: number = getRandomInt(1, dice.diceToRoll);
        rolls.push(roll);
      }
    });
    return rolls;
  }

  convertDices(dices: string[]): diceObject[] {
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
        if (destructuredDice[0] > 100) {
          return null;
        }
        convertedDices.push({
          //their input is something like 2d6.
          timesToRoll: destructuredDice[0],
          diceToRoll: destructuredDice[1],
        });
      }
    });
    return convertedDices;
  }

  async run(msg: Message) {
    const userInput: string = removePrefix(msg.content, this.client.config.prefix);
    let diceRegex: RegExp = /\d*?d\d{1,}/g;
    let extractedDices: string[] | null = userInput.match(diceRegex);
    if (extractedDices === null) {
      //if no dices matched
      outputEmbed(
        msg.channel,
        `Sorry I couldn't find any valid dices in your message. Try using help command to see an example of usage`,
        {
          color: this.client.config.colors.error,
        }
      );
      return;
    }
    let diceObjectArray: diceObject[] = this.convertDices(extractedDices);

    if (!diceObjectArray.length) {
      outputEmbed(msg.channel, "You cannot roll one dice more than 100 times", {
        color: this.client.config.colors.warn,
      });
      return;
    }

    let diceRolls: number[] = this.rollDices(diceObjectArray);
    let calculatedSum: number = diceRolls.reduce((acc: number, cur: number) => {
      return acc + cur;
    }, 0);

    const [sentMessage, embedReference] = await outputEmbed(
      msg.channel,
      `Rolling **${extractedDices.toString()}**...`,
      {
        color: this.client.config.colors.info,
      }
    );

    setTimeout(() => {
      //editing a message after a timeout? Always check if it's still there
      if (sentMessage.deleted) return;
      //add some fancy shit
      embedReference
        .setColor(this.client.config.colors.success)
        .setDescription(`You've rolled: **${diceRolls.toString()}**\nTotal: **${calculatedSum}**`);
      //edit a message with an embed reference that's now been changed
      sentMessage.edit(embedReference);
    }, 1000);
  }
}

module.exports = Roll;
