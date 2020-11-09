import { Message } from "discord.js";
import { get, makeTemplate } from "../../utils/musicStorage";

export default async (msg: Message) => {
    let d = get(msg.guild.id);

    if (msg.member.voice.channel.id !== d.channelId)
        return msg.channel.send('you\'re not on this channel')

    if (!d.joined)
        return msg.channel.send('bot isnt on any channel')
    
    if (d.isPlaying)
        await d.dispatcher.end();

    msg.member.voice.channel.leave();
    makeTemplate(msg.guild.id);

    msg.react('🚪');
}