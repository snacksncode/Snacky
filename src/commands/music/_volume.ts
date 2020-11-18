// import { Message } from "discord.js";
// import { get, set } from "../../utils/music/queueManager";

// export default (msg: Message) => {
//   let d = get(msg.guild.id);

//   if (msg.member.voice.channel.id !== d.channelId)
//     return msg.channel.send("youre not on bots channel");

//   if (!d.isPlaying) return msg.channel.send("bot is not playing");

//   let vol = Number(msg.content.split(" ")[1]);

//   if (Number.isNaN(vol)) return msg.channel.send("NAN");

//   if (vol > 2.0 || vol < 0.1) return msg.channel.send("too high or too low value");

//   if (d.bassBoost) d.bassBoost = false;

//   d.volume = vol;
//   d.dispatcher.setVolume(d.volume);

//   msg.react("🎛️");

//   set(msg.guild.id, d);
// };
