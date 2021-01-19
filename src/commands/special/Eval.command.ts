import { Message, CommandInterface, BotClient, MessageEmbed } from "discord.js";
import { inspect } from "util";
import Command from "../../base/Command";
import * as utils from "../../utils/generic";

interface CensoredData {
  censoredOutput: string;
  tokenPieceDetected: boolean;
}

class Eval extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "eval",
      description: "Executes JS code provided after command invocation",
      usage: `<prefix>eval [code]`,
      category: "Special",
      hidden: true,
    });
  }

  async run(msg: Message) {
    if (msg.author.id !== this.client.config.ownerId) {
      utils.outputEmbed(msg.channel, "You're not allowed to execute this command", {
        color: this.client.config.colors.warn,
        footerText: "Eval command is owner-only due to it being extremely unsafe",
      });
      return; //whoops
    }
    const config = this.client.config;
    if (msg.content.includes("token")) {
      return utils.outputEmbed(
        msg.channel,
        'Your message contains string "token" and was stopped from execution.',
        {
          color: config.colors.warn,

          title: "Security error",
        }
      );
    }
    const outputAsEmbed = msg.content.includes("--use-embed");
    const discordMessageLimit = 1950;
    const codeToExecute = msg.content
      .replace(`${this.client.config.prefix}eval `, "")
      .replace("--use-embed", "");
    if (codeToExecute.length === 0) {
      return utils.outputEmbed(
        msg.channel,
        "You need to enter something to evaluate after command invocation.",
        {
          color: config.colors.warn,

          title: "Incorrect usage",
        }
      );
    }
    try {
      const embed = new MessageEmbed();
      let executedCode = await eval(codeToExecute);

      if (typeof executedCode !== "string") {
        executedCode = this.convertObjectToString(executedCode);
      }

      const messagesToSend = this.splitMsgOnLimit(executedCode, discordMessageLimit);
      for (let message of messagesToSend) {
        let evaluatedCode = this.censorPrivateInfo(message);
        if (evaluatedCode.tokenPieceDetected) {
          return utils.outputEmbed(
            msg.channel,
            "Evaluated code execution was blocked due to token detection algorithm.",
            {
              color: config.colors.warn,

              title: "Security error",
            }
          );
        }
        if (outputAsEmbed) {
          return await utils.sendMsg(msg.channel, embed);
        }
        await utils.sendMsg(msg.channel, `\`\`\`js\n${evaluatedCode.censoredOutput}\`\`\``);
      }
    } catch (err) {
      utils.outputEmbed(msg.channel, err.message, {
        color: config.colors.error,

        title: "Error message:",
      });
      this.client.logger.log({ name: "Eval: Error", color: "error" }, `\n${err}`);
    }
  }

  //used to output objects properly
  convertObjectToString(obj: object): string {
    return inspect(obj);
  }

  //splits messages longer than 2000 char into an array of smaller ones
  splitMsgOnLimit(input: string, limit: number): string[] {
    let output: string[] = [];
    while (input.length) {
      output.push(input.substr(0, limit));
      input = input.substr(limit);
    }
    return output;
  }

  //"algorithm" that looks for pieces of token in input.
  checkIfInputContainsTokenPiece(input: string, token: string): boolean {
    let arrayOfTokenPieces = token.match(/.{4}/g);
    let containsPiece = false;
    arrayOfTokenPieces.forEach((piece) => {
      if (input.includes(piece)) {
        containsPiece = true;
      }
    });
    return containsPiece;
  }

  //censors sensitive info such as tokens
  censorPrivateInfo(input: string): CensoredData {
    let censoredOutput: string = "";
    const privateInfo = [this.client.config.token];
    let tokenPieceDetected = false;
    privateInfo.forEach((privateToken) => {
      if (this.checkIfInputContainsTokenPiece(input, privateToken)) {
        tokenPieceDetected = true;
      }
      censoredOutput = input.replaceAll(privateToken, "[ Private ]");
    });
    return { censoredOutput, tokenPieceDetected };
  }
}

module.exports = Eval;
