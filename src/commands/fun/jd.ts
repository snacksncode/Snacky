import { Message, MessageEmbed } from "discord.js";
import { colors } from "../../config";
import getRandomInt from "../../utils/getRandomInt";
import outputEmbed from "../../utils/outputEmbed";
import stateReact from "../../utils/stateReact";

function jdCommand(msg: Message) {
  const pics: string[] = [
    "https://samequizy.pl/wp-content/uploads/2020/02/filing_images_40f413228d54-7.jpg",
    "https://www.wykop.pl/cdn/c3201142/comment_TgSsTCz6RsWyjjt6AdjMmFCLSD0aemII.jpg",
    "https://samequizy.pl/wp-content/uploads/2020/08/images_7154a400dd7d.jpg",
    "https://www.wykop.pl/cdn/c3201142/comment_DBvdUPadhLBShtHS8mJpkdE4RRoItjsn.jpg",
    "https://www.wykop.pl/cdn/c3201142/comment_1585212279IfQgRYtMxhthb2vDCN5nbU.jpg",
    "https://tablica-rejestracyjna.pl/images/photos/20201012171457.jpg",
    "https://samequizy.pl/wp-content/uploads/2017/12/filing_images_f151ac64e4d8.jpg",
    "https://i.ytimg.com/vi/J40cRgM3A3Y/hqdefault.jpg",
    "https://i.ytimg.com/vi/9W-Drbcx3fI/maxresdefault.jpg",
    "https://samequizy.pl/wp-content/uploads/2018/02/filing_images_9255aea48e13.jpg",
  ];
  const lastImageUrl: string | null = null;
  let chosenImageUrl: string | null = null;
  const execTimestamp = Date.now();

  function getRandomImage(index: number): string {
    return pics[index];
  }

  while (!chosenImageUrl) {
    const runTimestamp = Date.now();
    if (runTimestamp - execTimestamp > 10000) {
      stateReact(msg, "error");
      outputEmbed(
        msg.channel,
        "Program took too long to pick random image.",
        colors.error,
        "Timeout exceeded"
      );
    }
    let randomImage = getRandomImage(getRandomInt(0, pics.length - 1));
    if (randomImage === lastImageUrl) continue;
    chosenImageUrl = randomImage;
  }

  const embed = new MessageEmbed()
    .setTitle(`Jebać Disa`)
    .setImage(chosenImageUrl)
    .setColor(colors.default);

  msg.channel.send(embed);
}

export default jdCommand;
