import { Collection, Message, TextChannel, User } from "discord.js";
import checkForPermissions from "../../utils/checkForPermissions";
import outputEmbed from "../../utils/outputEmbed";

function clearCommand(
  msg: Message,
  userInput: string,
  mentionedUsers: Collection<string, User>,
  channel: TextChannel
) {
  //check for permissions
  if (!checkForPermissions(["ADMINISTRATOR", "MANAGE_MESSAGES"], msg.member)) {
    outputEmbed(
      `You do not have sufficient permissions to use \`clear\` command.`,
      msg,
      "error"
    );
    return;
  }

  //search for --help flag and trigger help message if found
  let hasHelpFlag: boolean = !!userInput.match(/--help/g);
  if (hasHelpFlag) {
    outputEmbed(
      `Clear command is used to bulk delete some amount of messages.\n
      Usage: \`[prefix]clear <number>\`\n
      If you have permissions to manage messages bot will delete <number> amount of last messages in the channel\n
      Maximum number of messages you're allowed to delete is 100.`,
      msg,
      "info",
      `Help | Clear Command`
    );
    return;
  }

  //parsing user input (amount of messages)
  let msgsToDel: number = userInput
    .match(/\s\d{1,}\s?/g)
    ?.map((match) => Number(match))
    ?.shift();

  //error handling
  try {
    if (isNaN(msgsToDel)) throw "Provide number of messages to delete.";
    if (mentionedUsers.size > 1) throw "You cannot clear messages of multiple users.";
    if (msgsToDel > 100) throw "You cannot clear more than 100 messages.";
  } catch (err) {
    return outputEmbed(err, msg, "error");
  }

  //now that numberOfMessages is not null, clamp number
  const successMsgDelTimeout = 10000;

  //fetch messages
  channel.messages.fetch({ limit: 100, before: msg.id }).then((messages) => {
    let filteredMessagesArray: Message[] = [];
    let mentionedUser = mentionedUsers.first();

    if (mentionedUsers.size === 0) {
      filteredMessagesArray = messages.array().slice(0, msgsToDel);
    } else {
      filteredMessagesArray = messages
        .filter((message) => message.author.id === mentionedUser.id)
        .array()
        .slice(0, msgsToDel);
    }

    //trigger deletion of messages
    channel
      .bulkDelete(filteredMessagesArray)
      .then((messages: Collection<string, Message>) => {
        msg.react("✅");
        outputEmbed(`Deleted last ${messages.size} messages`, msg, "success").then(
          (msg) => {
            msg.delete({ timeout: successMsgDelTimeout });
          }
        );
      });
  });
}
export default clearCommand;
