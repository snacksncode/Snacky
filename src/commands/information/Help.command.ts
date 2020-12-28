import Command from "../../base/Command";
import { Message, CommandInterface, BotClient, EmbedFieldData, Collection } from "discord.js";
import { outputEmbed } from "../../utils/generic";

class Help extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "help",
      description: "Shows for how long bot has been running",
      usage: "<prefix>help [command?]",
      aliases: ["runtime"],
      category: "Information",
    });
  }

  run(msg: Message) {
    const userInput = msg.content;
    const regExp = new RegExp(`${this.client.config.prefix}help\\s?(\\w*)?`, "g");
    const matches = userInput.matchAll(regExp);
    const parsedCommandName: string | null = matches.next().value?.[1];
    if (!parsedCommandName) {
      //user did not input a command name after command invocation.
      //just display all the avaible commands
      outputEmbed(msg.channel, "", {
        color: this.client.config.colors.info,
        title: "Showing all avaible commands",
        fields: this.generateHelpFields(this.client.commands),
      });
    } else {
      //use wants to get more information about specific command.
      //it's name is avaible in parsedCommandName
      const command =
        this.client.commands.get(parsedCommandName) ||
        this.client.commands.find(
          (cmd) => cmd.info.aliases && cmd.info.aliases.includes(parsedCommandName)
        );
      if (!command) {
        outputEmbed(msg.channel, `Command \`${parsedCommandName}\` doesn't exist`, {
          color: this.client.config.colors.error,
        });
        return;
      }
      outputEmbed(msg.channel, "", {
        color: this.client.config.colors.info,
        title: `Information about ${command.commandName} command`,
        fields: this.generateHelpForCommand(command),
      });
    }
  }
  generateHelpFields(commands: Collection<string, CommandInterface>): EmbedFieldData[] {
    const generatedFields: EmbedFieldData[] = [];
    const categorizedCommands: { [key: string]: string[] } = {};
    //dynamically determine categories of commands
    commands.forEach((cmd) => {
      //ignore command if it's hidden
      if (cmd.info.hidden) return;
      //create category if it's not there yet
      if (!categorizedCommands.hasOwnProperty(cmd.info.category)) {
        categorizedCommands[cmd.info.category] = [];
      }
      //put command name in it's category
      categorizedCommands[cmd.info.category].push(cmd.commandName);
    });
    for (let [category, commandsInsideCategory] of Object.entries(categorizedCommands)) {
      generatedFields.push({
        name: category,
        value: commandsInsideCategory.toString().replaceAll(",", ", "),
      });
    }
    return generatedFields;
  }
  generateHelpForCommand(command: CommandInterface): EmbedFieldData[] {
    const fields: EmbedFieldData[] = [];
    for (let [key, _value] of Object.entries(command.info)) {
      if (key === "hidden") continue;
      if (_value === [] || _value === "" || _value.length === 0) continue;
      fields.push({
        name: this.getReadableKey(key),
        value: _value,
      });
    }
    return fields;
  }

  getReadableKey(key: string) {
    switch (key) {
      case "aliases":
        return "Avaible aliases";
      case "description":
        return "Command description";
      case "usage":
        return "Usage";
      case "example":
        return "Here's an example";
      case "permissions":
        return "Required permissions";
      case "category":
        return "Command category";
    }
  }
}

module.exports = Help;
