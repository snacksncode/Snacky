import { Message } from "discord.js";
import { get, set } from "./musicStorage";
import ytdl = require('ytdl-core');

const hook = async (msg: Message, firstTime: boolean = false) => {
    let d = get(msg.guild.id);

    if (d.queue[0]) {
        d.isPlaying = true;

        if (!d.loop && !firstTime)
            d.queue.shift();
        
        try {
            const { videoDetails } = await ytdl.getBasicInfo(d.queue[0].url);
            msg.channel.send(`now playing: ${videoDetails.title}`);
        } catch(_) {

        }

        d.dispatcher = d.connection.play(
            ytdl(
                d.queue[0].url,
                {
                    quality: "highestaudio"
                }
            ),
            {
                volume: (d.bassBoost) ? 10.0 : d.volume
            }
        );
    } else {
        d.isPlaying = false;
        d.dispatcher = null;
    }

    set(msg.guild.id, d);
}

export default hook;