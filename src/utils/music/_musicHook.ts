// import { Message } from "discord.js";
// import { getQueue, setQueue } from "./queueManager";
// import ytdl = require("ytdl-core");

// const hook = async (msg: Message, firstTime: boolean = false) => {
//   let d = get(msg.guild.id);

//   if (d.queue[0]) {
//     d.isPlaying = true;

//     if (!d.loop && !firstTime) d.queue.shift();

//     msg.channel.send(`now playing: ${d.queue[0].name} (${d.queue[0].length})`);

//     d.dispatcher = d.connection
//       .play(
//         ytdl(d.queue[0].url, {
//           quality: "highestaudio",
//         }),
//         {
//           volume: d.bassBoost ? 10.0 : d.volume,
//         }
//       )
//       .on("finish", () => hook(msg));
//   } else {
//     d.isPlaying = false;
//     d.dispatcher = null;
//   }

//   set(msg.guild.id, d);
// };

// export default hook;
