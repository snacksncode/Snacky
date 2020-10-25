import { Collection, Message, TextChannel, User } from "discord.js";
import { colors } from "../../config";
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
      msg.channel,
      `You do not have sufficient permissions to use \`clear\` command.`,
      colors.info
    );
    return;
  }

  //search for --help flag and trigger help message if found
  let hasHelpFlag: boolean = !!userInput.match(/--help/g);
  if (hasHelpFlag) {
    outputEmbed(
      msg.channel,
      `Clear command is used to bulk delete some amount of messages.\n
      Usage: \`[prefix]clear <number>\`\n
      If you have permissions to manage messages bot will delete <number> amount of last messages in the channel\n
      Maximum number of messages you're allowed to delete is 100.`,
      colors.info,
      `Help | Clear Command`
    );
    return;
  }

  //parsing user input (amount of messages)
  let withCommandFlag: boolean = !!userInput.match(/--include-command/g);
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
    return outputEmbed(msg.channel, err, colors.error, "Error");
  }

  //now that numberOfMessages is not null, clamp number
  const successMsgDelTimeout = 10000;

  //fetch messages
  channel.messages
    .fetch({ limit: 100, before: withCommandFlag ? null : msg.id })
    .then((messages) => {
      let filteredMessagesArray: Message[] = [];
      let mentionedUser = mentionedUsers.first();
      msgsToDel = withCommandFlag ? msgsToDel + 1 : msgsToDel;

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
          if (!withCommandFlag) msg.react("✅");
          outputEmbed(
            msg.channel,
            `Deleted last ${messages.size} messages`,
            colors.success
          ).then((msg) => {
            setTimeout(() => {
              //prevent crash. If user deleted some more messages including bot's
              //before timeout expires
              if (msg.deleted) return;

              msg.delete();
            }, successMsgDelTimeout);
          });
        });
    });
}
export default clearCommand;
