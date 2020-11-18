// import { Message } from "discord.js";
// import { get, set } from "../../utils/music/queueManager";

// export default (msg: Message) => {
//   let d = get(msg.guild.id);

//   if (msg.member.voice.channel.id !== d.channelId)
//     return msg.channel.send("youre not on bot channels");

//   if (!d.queue[0]) return msg.channel.send("empty queue");

//   d.loop = !d.loop;

//   msg.channel.send(`${d.loop} loop`);

//   set(msg.guild.id, d);
// };
