import { Message, MessageEmbed } from "discord.js";
import { get } from "../../utils/musicStorage";

export default (msg: Message) => {
    let queue = [];
    const d = get(msg.guild.id);

    if (msg.member.voice.channel.id !== d.channelId)
        return msg.channel.send('youre not on this channel');

    if (d.queue.length === 0)
        queue.push({
            name: `Empty queue`,
            value: '\u200B'
        });
    else
        for (let i in d.queue) {
            let b = Number(i);
            if (b > 9 && d.queue.length - b > 0) {
                queue.push({
                    name: `${d.queue.length - b} more songs.`,
                    value: `\u200B`
                });
                break;
            }

            queue.push({
                name: d.queue[i].author,
                value: `${b + 1}. ${d.queue[i].name}${b === 0 ? " (playing rn)" : ""}`
            })
        }

    msg.channel.send(
        new MessageEmbed()
            .setColor(0x34c759)
            .setTitle("queue")
            .addFields(queue)
            .setFooter("pog")
    )
}