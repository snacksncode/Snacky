import { Message } from "discord.js";
import { get } from "../../utils/musicStorage";
import join from "./join";

export default (msg: Message) => {
    let d = get(msg.guild.id);
    if (d.channelId !== msg.member.voice.channel.id && !d.joined)
        join(msg);
};