import { Message } from "discord.js";
import { get } from "../../utils/musicStorage";

export default async (msg: Message) => {
    let d = get(msg.guild.id);

    if (d.channelId !== msg.member.voice.channel.id)
        return msg.channel.send('not on yours channel');

    if (!d.isPlaying)
        return msg.channel.send('not playing');
    
    d.queue = [];
    d.dispatcher.end();

    msg.react('🚫');
}