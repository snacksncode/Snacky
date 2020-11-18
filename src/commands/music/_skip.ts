// import { Message } from "discord.js";
// import { get, set } from "../../utils/musicStorage";

// export default async (msg: Message) => {
//     let d = get(msg.guild.id);

//     if (msg.member.voice.channel.id !== d.channelId)
//         return msg.channel.send('youre not on this channel');

//     if (d.queue.length === 0)
//         return msg.channel.send('nothing in queue');

//     let args = msg.content.split(" ");
//     args.shift();

//     if (args.length > 0 && Number(args[0]) - 1 !== 0) {

//         if (Number.isNaN(Number(args[0])))
//             return msg.channel.send('NAN');

//         if (d.queue.length < Number(args[0]) - 1 || Number(args[0]) - 1 < 1)
//             return msg.channel.send('the value is too high or too small');

//         d.queue.splice(Number(args[0]) - 1, 1);

//     } else {
//         let prevLoop;
//         if (d.loop) {
//             d.loop = false;
//             prevLoop = true;
//         }

//         if (d.queue.length === 1)
//             d.queue.shift();

//         await d.dispatcher?.end();

//         if (prevLoop) {
//             setTimeout(() => {
//                 let b = get(msg.guild.id);
//                 b.loop = true;
//                 set(msg.guild.id, b);
//             }, 200);
//         }
//     }
//     set(msg.guild.id, d);

//     msg.react('⏭️');
// }
