import { Message, MessageEmbed } from "discord.js";
import { colors } from "../../config";
import getRandomInt from "../../utils/getRandomInt";
import outputEmbed from "../../utils/outputEmbed";
import stateReact from "../../utils/stateReact";

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
let lastImageUrl: string | null = null;

function jdCommand(msg: Message) {
  let chosenImageUrl: string | null = null;
  let timesLooped = 0;

  function getRandomImage(index: number): string {
    return pics[index];
  }

  while (!chosenImageUrl) {
    timesLooped++;
    if (timesLooped > 100) {
      stateReact(msg, "error");
      return outputEmbed(
        msg.channel,
        "Program tries to pick different image every time. This error means that theres only 1 image in array.",
        {
          color: colors.error,
          title: "Timeout exceeded",
        }
      );
    }
    let randomImage = getRandomImage(getRandomInt(0, pics.length - 1));
    if (randomImage === lastImageUrl) continue;
    chosenImageUrl = randomImage;
  }

  lastImageUrl = chosenImageUrl;
  const embed = new MessageEmbed()
    .setTitle(`Jebać Disa`)
    .setImage(chosenImageUrl)
    .setColor(colors.warn);

  msg.channel.send(embed);
}

export default jdCommand;
