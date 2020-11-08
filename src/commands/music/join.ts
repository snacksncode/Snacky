import { Message } from "discord.js";
import { colors } from "../../config";
import { get } from '../../utils/musicStorage';
import outputEmbed from '../../utils/outputEmbed';

export default (msg: Message) => {
    if (!get(msg.guild.id).isPlaying)
        return outputEmbed(
            msg.channel,
            "**Bot is playing RN.**",
            colors.info
        )

    return msg.channel.send(JSON.stringify(get(msg.guild.id)));
};