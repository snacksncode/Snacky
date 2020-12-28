import { BotClient, Event, Message, MessageEmbed } from "discord.js";
import EventBase from "../base/Event";
import { outputEmbed, removePrefix, sendMsg } from "../utils/generic";

class MessageEvent extends EventBase implements Event {
  constructor(client: BotClient) {
    super(client, {
      eventName: "message",
    });
  }
  run(msg: Message) {
    const channel = msg.channel;
    if (channel.type === "dm") return;
    //check if message contains a prefix, if not stop the execution
    const isCommand = msg.content.startsWith(this.client.config.prefix);
    if (!isCommand) return;
    //parse user input
    const userInput = removePrefix(msg.content.trim(), this.client.config.prefix);
    const args = userInput.split(" ");
    const requestedCommand = args
      .shift()
      .replace(/\||`|~|\*|_|\"/g, "")
      .replace(/\s{2,}/g, " ")
      .toLowerCase();
    //try finding command
    const commandClass =
      this.client.commands.get(requestedCommand) ||
      this.client.commands.find(
        (cmd) => cmd.info.aliases && cmd.info.aliases.includes(requestedCommand)
      );
    //if neither aliases or command name returned a class that means command doesnt exist
    if (!commandClass) {
      outputEmbed(msg.channel, `Command \`${requestedCommand}\` doesn't exist`, {
        color: this.client.config.colors.error,
      });
      return;
    }
    //if there are some permissions that need checking
    if (commandClass.info.permissions.length > 0) {
      let missingPerms = [];
      commandClass.info.permissions.forEach((perm) => {
        if (!msg.member.hasPermission(perm)) {
          missingPerms.push(perm);
        }
      });
      if (missingPerms.length > 0) {
        //if we detected some missing perms. Notify user and stop execution
        outputEmbed(
          channel,
          `You're missing permissions to execute this command.\nMissing permissions: ${missingPerms.toString()}`,
          {
            color: this.client.config.colors.error,
          }
        );
        return;
      }
    }
    //run the command
    try {
      commandClass.run(msg);
    } catch (err) {
      const errorEmbed = new MessageEmbed();
      errorEmbed
        .setTitle(`Crash prevented | Runtime error during ${commandClass.commandName} command`)
        .setDescription(`<@${this.client.config.ownerId}>\n---------------\n${err.message}`)
        .setFooter("Full errorstack was logged into console")
        .setTimestamp()
        .setColor(this.client.config.colors.error);
      sendMsg(msg.channel, errorEmbed);

      this.client.logger.log({ name: "Runtime error", color: "error" }, `\n${err}`);
    }
  }
}

module.exports = MessageEvent;
