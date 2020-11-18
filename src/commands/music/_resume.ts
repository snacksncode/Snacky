// import { Message } from "discord.js";
// import { get } from "../../utils/musicStorage";

// export default (msg: Message) => {
//     let d = get(msg.guild.id);

//     if (d.channelId !== msg.member.voice.channel.id)
//         return msg.channel.send("youre not on this channel");

//     if (!d.queue[0])
//         return msg.channel.send("nothing to resume");

//     d.dispatcher.resume();

//     msg.react('▶️');
// }
