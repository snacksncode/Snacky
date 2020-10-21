import { Collection, Message, TextChannel } from "discord.js";
import checkForPermissions from "../utils/checkForPermissions";
import clampNumber from "../utils/clampNumber";
import outputEmbedMessage from "../utils/outputEmbedMessage";

const clearCommand = (
  msg: Message,
  userInput: string,
  channel: TextChannel
) => {
  if (!checkForPermissions(["ADMINISTRATOR", "MANAGE_MESSAGES"], msg.member)) {
    outputEmbedMessage(
      `You do not have sufficient permissions to use \`clear\` command.`,
      msg,
      "error"
    );
    return;
  }
  const clearTimeout = 10000;
  let numberOfMessages: number = Number(userInput.match(/\d/g)[0]);
  if (isNaN(numberOfMessages)) {
    outputEmbedMessage(
      `Please provide the number of messages to delete after initializing command.`,
      msg,
      "error"
    );
    return;
  }
  numberOfMessages = clampNumber(numberOfMessages + 1, 1, 100);
  channel
    .bulkDelete(numberOfMessages)
    .then((messages: Collection<string, Message>) => {
      outputEmbedMessage(
        `Deleted last ${clampNumber(messages.size - 1, 1, 100)} messages`,
        msg,
        "success"
      ).then((msg) => {
        msg.delete({ timeout: clearTimeout });
      });
    });
};
export default clearCommand;
