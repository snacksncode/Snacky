import { Message, MessageEmbed, TextChannel } from 'discord.js';

const pingCommand = (msg: Message, channel: TextChannel): void => {
  const botLatency = Date.now() - msg.createdTimestamp;
  const apiLatency = msg.client.ws.ping;
  const embed: MessageEmbed = new MessageEmbed()
    .setTitle("Pong! Connection established!")
    .setColor("#9CCC65")
    .setDescription(`Bot latency **${botLatency}ms** | Discord Api latency **${apiLatency}ms**`)

  channel.send(embed);
}
export default pingCommand;