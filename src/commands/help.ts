import { MessageEmbed, TextChannel } from 'discord.js';
import { prefix, version } from '../config';

const helpCommand = (channel: TextChannel): void => {
  const helpEmbed: MessageEmbed = new MessageEmbed()
    .setTitle("First time? Here's some info")
    .setColor("#5C6BC0")
    .addField("Current prefix: ", `${prefix}`, true)
    .addField("Current version: ", `${version}`, true)
    .setDescription(`**Avaible commands**

    \`help\` - outputs this

    \`ping\` - check connection & ping

    \`clear <number>\` - deletes last <number> of messages
    
    \`cum\` - sets your nickname to **cum**
    
    \`avatar <user?> --size?=<size>\` - shows mentioned user's avatar or if no one mentioned shows avatar of author of the message. **--size** flag is optional and accepts only values: 16, 32, 64, 128, 256, 512, 1024, 2048
    `)

  channel.send(helpEmbed);
}
export default helpCommand;