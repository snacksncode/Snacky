//@ts-nocheck noUnusedLocals
import { Message, Client, MessageEmbed } from "discord.js";
import * as config from "../../config";
import censorPrivateInfo from "../../utils/censorPrivateInfo";
import convertObjectToString from "../../utils/convertObjectToString";
import outputEmbed from "../../utils/outputEmbed";
import sendMsg from "../../utils/sendMsg";
import splitMsgOnLimit from "../../utils/splitMsgOnIndex";
import { createQueue, getQueue, setQueue } from "../../utils/music/queueManager";

async function evalCommand(msg: Message) {
  if (msg.content.includes("token")) {
    return outputEmbed(
      msg.channel,
      'Your message contains string "token" and was stopped from execution.',
      {
        color: config.colors.warn,
        author: msg.author,
        title: "Security error",
      }
    );
  }
  const outputAsEmbed = msg.content.includes("--use-embed");
  const discordMessageLimit = 1950;
  const client: Client = msg.client;
  if (!config.usersAllowedToUseEval.includes(msg.author.id)) {
    return outputEmbed(msg.channel, "You're not allowed to execute eval command", {
      color: config.colors.warn,
      title: "Permissions warning",
      author: msg.author,
    });
  }
  const codeToExecute = msg.content.replace(`${config.prefix}eval `, "").replace("--use-embed", "");
  if (codeToExecute.length === 0) {
    return outputEmbed(
      msg.channel,
      "You need to enter something to evaluate after command invocation.",
      {
        color: config.colors.warn,
        author: msg.author,
        title: "Incorrect usage",
      }
    );
  }
  try {
    const embed = new MessageEmbed();
    let executedCode = await eval(codeToExecute);

    if (typeof executedCode !== "string") {
      executedCode = convertObjectToString(executedCode);
    }

    const messagesToSend = splitMsgOnLimit(executedCode, discordMessageLimit);
    for (let message of messagesToSend) {
      let evaluatedCode = censorPrivateInfo(message);
      if (evaluatedCode.tokenPieceDetected) {
        return outputEmbed(
          msg.channel,
          "Evaluated code execution was blocked due to token detection algorithm.",
          {
            color: config.colors.warn,
            author: msg.author,
            title: "Security error",
          }
        );
      }
      if (outputAsEmbed) {
        return await sendMsg(msg.channel, embed);
      }
      await sendMsg(msg.channel, `\`\`\`js\n${evaluatedCode.censoredOutput}\`\`\``);
    }
    const finishedEmbed = new MessageEmbed()
      .setFooter("Finished executing code.")
      .setColor(config.colors.success);
    return sendMsg(msg.channel, finishedEmbed);
  } catch (err) {
    outputEmbed(msg.channel, err.message, {
      color: config.colors.error,
      author: msg.author,
      title: "Error message:",
    });
    console.log(err.stack);
  }
}

export default evalCommand;
