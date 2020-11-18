// import { Message, VoiceConnection } from "discord.js";
// import { get, set } from "../../utils/music/queueManager";
// import ytdl = require("ytdl-core");
// import ytpl from "ytpl";
// import searchYoutube from "youtube-api-v3-search";
// import join from "./_join";
// import hook from "../../utils/music/musicHook";
// import { Song } from "../../typings/storage";

// export default async (msg: Message) => {
//   let d = get(msg.guild.id),
//     conn: VoiceConnection | boolean,
//     info: Song | null = null;

//   if (d.channelId !== msg.member.voice.channel.id && d.joined)
//     return msg.channel.send("you cannot use play command if bot is not in your channel");

//   if (!d.joined) conn = await join(msg);
//   else conn = d.connection;

//   if (!conn) return;

//   let input = msg.content.replace(msg.content.split(" ")[0], "");

//   if (ytdl.validateID(input) || ytdl.validateURL(input)) {
//     try {
//       let { videoDetails } = await ytdl.getBasicInfo(input);
//       let l = Number(videoDetails.lengthSeconds);

//       if (l > 3600) return msg.channel.send("longer than 1h");

//       let minutes = Math.floor(l / 60),
//         seconds = l - minutes * 60;

//       info = {
//         name: videoDetails.title,
//         url: videoDetails.video_url,
//         author: videoDetails.author.name,
//         thumbnail: `https://i.ytimg.com/vi/${videoDetails.videoId}/hqdefault.jpg`,
//         length: `${`00${minutes}`.substr(-2)}:${`00${seconds}`.substr(-2)}`,
//       };
//     } catch (_) {
//       return msg.channel.send("video failed?");
//     }
//   } else if (ytpl.validateID(input)) {
//     try {
//       let pl = await ytpl(input),
//         count = 0;

//       for (let v in pl.items) {
//         let i = pl.items[v];
//         if (i.duration !== null) {
//           let length = i.duration
//             .split(":")
//             .reverse()
//             .reduce((prev, curr, i) => prev + Number(curr) * Math.pow(60, i), 0);
//           if (length < 3600) {
//             if (!(d.queue.filter((el) => el.name === i.title).length > 0)) {
//               d.queue.push({
//                 name: i.title,
//                 author: i.author.name,
//                 url: i.url_simple,
//                 thumbnail: i.thumbnail,
//                 length: i.duration,
//               });
//               count++;
//             }
//           }
//         }
//       }

//       if (count === 0) return msg.channel.send("cannot add anyone video from playlist");
//     } catch (_) {
//       return msg.channel.send("playlist failed?");
//     }
//   } else {
//     try {
//       let v = await searchYoutube(process.env.YTTOKEN, {
//         q: input,
//         part: "snippet",
//         type: "video",
//         maxResults: 1,
//       });

//       if (v?.error?.code === 403) return msg.channel.send("quota exceeded");

//       if (v?.items?.length < 1) return msg.channel.send("video not found");

//       try {
//         let { videoDetails } = await ytdl.getBasicInfo(v.items[0].id.videoId);
//         let l = Number(videoDetails.lengthSeconds);

//         if (l > 3600) return msg.channel.send("longer than 1h");

//         let minutes = Math.floor(l / 60),
//           seconds = l - minutes * 60;

//         info = {
//           name: videoDetails.title,
//           url: videoDetails.video_url,
//           author: videoDetails.author.name,
//           thumbnail: `https://i.ytimg.com/vi/${videoDetails.videoId}/hqdefault.jpg`,
//           length: `${`00${minutes}`.substr(-2)}:${`00${seconds}`.substr(-2)}`,
//         };
//       } catch (_) {
//         return msg.channel.send("video not available");
//       }
//     } catch (_) {
//       return msg.channel.send("error occured");
//     }
//   }

//   if (info !== null && d.queue.filter((el) => el.name === info.name).length > 0) {
//     console.log("---- queue ----");
//     console.log(d.queue);
//     console.log("--- info ---");
//     console.log(info);
//     return msg.channel.send("duplicate found");
//   }

//   if (info !== null) d.queue.push(info);

//   if (info !== null && d.isPlaying) msg.channel.send("added to queue");

//   set(msg.guild.id, d);

//   if (d.queue.length === 1 || !d.isPlaying) hook(msg, true);
// };
