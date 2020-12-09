import { Message } from "discord.js";
import { colors, prefix } from "../../config";
import listAllCommands from "../../utils/listAllCommands";
import outputEmbed from "../../utils/outputEmbed";

function helpCommand(msg: Message): Promise<Message> {
  //help flag
  const userInput = msg.content;
  const regExp: RegExp = new RegExp(`${prefix}help\\s?(\\w*)?`, "g");
  const matches: IterableIterator<RegExpMatchArray> = userInput.matchAll(regExp);
  const parsedValue: string | undefined | null = matches.next().value?.[1];
  if (!parsedValue) {
    //user typed in <prefix>help
    return outputEmbed(
      msg.channel,
      `Avaible commands:
      ${listAllCommands(msg.client.commands)}\n
      For more information about specific command type in **${prefix}help [command]**`,
      {
        color: colors.info,
        title: "First time? Here's some information",
      }
    );
  }
  const commandExists: boolean = msg.client.commands.has(parsedValue);
  if (!commandExists) {
    return outputEmbed(msg.channel, `Command \`${parsedValue}\` doesn't exist`, {
      color: colors.error,
      title: "Cannot get help for command",
    });
  }
  const mentionedCommand = msg.client.commands.get(parsedValue);
  return outputEmbed(msg.channel, "", {
    color: colors.info,
    title: `Information | ${mentionedCommand.commandName}`,
    fields: mentionedCommand.help(),
  });
}
export default helpCommand;
