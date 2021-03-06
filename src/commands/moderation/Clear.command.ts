import { Message, CommandInterface, BotClient, Collection, User } from "discord.js";
import Command from "../../base/Command";
import { stateReact, outputEmbed } from "../../utils/generic";

class Clear extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "clear",
      description:
        "Removes [number] amount of messages. You can also mention a user to only delete his messages",
      usage: "<prefix>clear [number] [member?] [--self?]",
      aliases: ["c", "purge"],
      category: "Moderation",
      permissions: ["MANAGE_MESSAGES"],
    });
  }

  run(msg: Message) {
    //parsing user input (amount of messages)
    const userInput: string = msg.content;
    const mentionedUsers: Collection<string, User> = msg.mentions.users;
    const channel = msg.channel;
    let withCommandFlag: boolean = !!userInput.match(/--(include-command|cs|self)/g);
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
      stateReact(msg, "error", this.client);
      return outputEmbed(msg.channel, errMsg, {
        color: this.client.config.colors.error,
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
            if (!withCommandFlag) stateReact(msg, "success", this.client);
            outputEmbed(msg.channel, `Deleted last ${messages.size} messages`, {
              color: this.client.config.colors.success,
            }).then(([msg, _embedReference]) => {
              setTimeout(() => {
                //To prevent crash. If user deleted some more messages including bot's
                //before timeout expires
                if (!msg.deleted) return msg.delete();
              }, successMsgDelTimeout);
            });
          })
          .catch((err) => {
            stateReact(msg, "error", this.client);
            console.error(err);
          });
      });
  }
}

module.exports = Clear;
