import Command from "../../base/Command";
import {
  Message,
  CommandInterface,
  BotClient,
  EmbedFieldData,
  Collection,
  CommandCategory,
} from "discord.js";
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

  async run(msg: Message) {
    const userInput = msg.content;
    const regExp = new RegExp(
      `${this.client.config.prefix}help\\s?(\\w*)?`,
      "g"
    );
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
          (cmd) =>
            cmd.info.aliases && cmd.info.aliases.includes(parsedCommandName)
        );
      if (!command) {
        outputEmbed(
          msg.channel,
          `Command \`${parsedCommandName}\` doesn't exist`,
          {
            color: this.client.config.colors.error,
          }
        );
        return;
      }
      outputEmbed(msg.channel, "", {
        color: this.client.config.colors.info,
        title: `Information about ${command.commandName} command`,
        fields: this.generateHelpForCommand(command),
      });
    }
  }
  generateHelpFields(
    commands: Collection<string, CommandInterface>
  ): EmbedFieldData[] {
    interface HelpCommandCategory {
      name: string;
      commands: string[];
    }
    const generatedFields: EmbedFieldData[] = [];
    const categorizedCommands: HelpCommandCategory[] = [];
    //go through every command and add it to it's category
    commands.forEach((cmd) => {
      //ignore command if it's hidden
      if (cmd.info.hidden) return;
      //get the index at which category should be created (categorizing)
      const categoryIndex = this.getCategoryIndexPosition(cmd.info.category);
      //create category if it's not there yet
      if (!categorizedCommands[categoryIndex]) {
        categorizedCommands[categoryIndex] = {
          name: cmd.info.category,
          commands: [],
        };
      }
      //put command name in it's category
      categorizedCommands[categoryIndex].commands.push(cmd.commandName);
    });
    for (let category of categorizedCommands) {
      generatedFields.push({
        name: category.name,
        value: category.commands.toString().replaceAll(",", ", "),
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

  getCategoryIndexPosition(categoryName: CommandCategory) {
    //I know this is ugly but oh well I want my help categorized ._.
    switch (categoryName) {
      case "Information":
        return 0;
      case "Moderation":
        return 1;
      case "Music":
        return 2;
      case "Fun":
        return 3;
      case "Special":
        return 4;
      case "Other":
        return 5;
    }
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
