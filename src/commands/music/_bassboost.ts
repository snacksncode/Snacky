// import { Message } from "discord.js";
// import { get, set } from "../../utils/musicStorage";

// export default (msg: Message) => {
//     let d = get(msg.guild.id);

//     if (msg.member.voice.channel.id !== d.channelId)
//         return msg.channel.send('youre not on bots channel');

//     if (!d.queue[0])
//         return msg.channel.send("empty queue");

//     d.bassBoost = !d.bassBoost;

//     if (d.bassBoost)
//         msg.react('😈');
//     else
//         msg.react('😴');

//     if (d.dispatcher)
//         d.dispatcher.setVolume(d.bassBoost ? 10.0 : d.volume);

//     set(msg.guild.id, d);
// }
