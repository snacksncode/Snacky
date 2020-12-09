// import { Message } from "discord.js";
// import { colors } from "../../config";
// import { get, makeTemplate, set } from "../../utils/musicStorage";
// import outputEmbed from "../../utils/outputEmbed";

// export default async (msg: Message) => {
//   let stg = get(msg.guild.id);

//   if (msg.member.voice.channel.id === null) {
//     outputEmbed(msg.channel, "**You're not currently in voice channel.**", colors.warn);
//     return false;
//   }

//   if (msg.member.voice.channel.id === stg.channelId) {
//     outputEmbed(msg.channel, "**You cannot rejoin bot.**", colors.warn);
//     return false;
//   }

//   if (stg.joined) {
//     outputEmbed(msg.channel, "**Bot is currently in another channel.**", colors.warn);
//     return false;
//   }

//   msg.react(`👀`);
//   return msg.member.voice.channel.join().then((conn) => {
//     stg.joined = true;
//     stg.connection = conn;
//     stg.channelId = msg.member.voice.channel.id;
//     const t = () => {
//       let d = get(msg.guild.id);

//       if (!d.isPlaying) {
//         d?.dispatcher?.end();
//         d?.connection?.channel?.leave();
//         console.log("Bot left the channel due to inactivity.");
//         makeTemplate(msg.guild.id);
//       } else {
//         d.timeout = setTimeout(t, 900000);
//         set(msg.guild.id, d);
//       }
//     };
//     stg.timeout = setTimeout(t, 900000);

//     set(msg.guild.id, stg);
//     return conn;
//   });
// };
