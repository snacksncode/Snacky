import { Collection, Message, User } from "discord.js";
import { colors } from "../../config";
import checkForPermissions from "../../utils/checkForPermissions";
import outputEmbed from "../../utils/outputEmbed";
import stateReact from "../../utils/stateReact";

function clearCommand(msg: Message) {
  //check for permissions
  if (!checkForPermissions(["ADMINISTRATOR", "MANAGE_MESSAGES"], msg.member)) {
    outputEmbed(msg.channel, `You do not have sufficient permissions to use \`clear\` command.`, {
      color: colors.info,

      title: "Missing permissions",
    });
    return;
  }

  //parsing user input (amount of messages)
  const userInput: string = msg.content;
  const mentionedUsers: Collection<string, User> = msg.mentions.users;
  const channel = msg.channel;
  let withCommandFlag: boolean = !!userInput.match(/--include-command/g);
  const successMsgDelTimeout = 10000;
  let msgsToDel: number = userInput
    .match(/\s\d{1,}\s?/g)
    ?.map((match) => Number(match))
    ?.shift();

  //error handling
  try {
    if (isNaN(msgsToDel)) throw "Provide number of messages to delete.";
    if (mentionedUsers.size > 1) throw "You cannot clear messages of multiple users.";
    if (msgsToDel > 100) throw "You cannot clear more than 100 messages.";
    if (channel.type !== "text") throw "You cannot use this command in DM or news channels";
  } catch (errMsg) {
    stateReact(msg, "error");
    return outputEmbed(msg.channel, errMsg, {
      title: "Error",
      color: colors.error,
    });
  }

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
          if (!withCommandFlag) stateReact(msg, "success");
          outputEmbed(msg.channel, `Deleted last ${messages.size} messages`, {
            color: colors.success,

            title: "Success",
          }).then((msg) => {
            setTimeout(() => {
              //prevent crash. If user deleted some more messages including bot's
              //before timeout expires
              if (!msg.deleted) return msg.delete();
            }, successMsgDelTimeout);
          });
        })
        .catch((err) => {
          stateReact(msg, "error");
          console.error(err);
        });
    });
}
export default clearCommand;
