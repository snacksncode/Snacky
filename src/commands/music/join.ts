import { Message } from "discord.js";
import { colors } from "../../config";
import { get } from '../../utils/musicStorage';
import outputEmbed from '../../utils/outputEmbed';

export default (msg: Message) => {
    let stg = get(msg.guild.id);

    if (msg.member.voice.channel.id === stg.channelId)
        return outputEmbed(
            msg.channel,
            "**You cannot rejoin bot.**",
            colors.info
        )

    if (get(msg.guild.id).joined)
        return outputEmbed(
            msg.channel,
            "**Bot is currently in another channel.**",
            colors.info
        )
    
    msg.member.voice.channel.join().then(conn => {
        stg.joined = true;
        stg.connection = conn;
        stg.channelId = msg.member.voice.channel.id;
    });

    msg.react(`👀`);
};