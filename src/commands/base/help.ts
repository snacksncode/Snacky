import { Message, MessageEmbed, TextChannel } from "discord.js";
import { prefix, version } from "../../config";
import outputEmbed from "../../utils/outputEmbed";

function helpCommand(channel: TextChannel, msg: Message, userInput: string): void {
  //help flag
  let hasHelpFlag: boolean = !!userInput.match(/--help/g);
  if (hasHelpFlag) {
    outputEmbed(`Really?`, msg, "info", `Help | Help Command`);
    return;
  }

  const helpEmbed: MessageEmbed = new MessageEmbed()
    .setTitle("First time? Here's some info")
    .setColor("#5C6BC0")
    .setDescription(
      `Avaible commands:\n
      \`help\`, \`ping\`, \`clear\`, \`avatar\`, \`cum\`\n
      For more information about specific command type in **[prefix]<command> --help**`
    )
    .addField("Current prefix: ", `${prefix}`, true)
    .addField("Current version: ", `${version}`, true);

  channel.send(helpEmbed);
}
export default helpCommand;

// .setDescription(
//   `Avaible commands:\n
//   \`help\` - outputs this\n
//   \`ping\` - check connection & ping\n
//   \`clear <number>\` - deletes last <number> of messages\n
//   \`avatar <user?> --size?=<size>\` - shows mentioned user's avatar or if no one mentioned shows avatar of author of the message. **--size** flag is optional and accepts only values: 16, 32, 64, 128, 256, 512, 1024, 2048\n
//   \`cum\` - sets your nickname to **cum**`
// )
