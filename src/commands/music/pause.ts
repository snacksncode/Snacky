import { Message } from "discord.js";
import { get } from "../../utils/musicStorage";

export default (msg: Message) => {
    let d = get(msg.guild.id);

    if (msg.member.voice.channel.id !== d.channelId)
        return msg.channel.send('you\'re not on this channel');

    if (!d.isPlaying)
        return msg.channel.send('not playing anything');

    d.dispatcher.pause();
    msg.react('⏸️');
}