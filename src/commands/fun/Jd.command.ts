import { Message, CommandInterface, BotClient, MessageEmbed } from "discord.js";
import Command from "../../base/Command";
import Vibrant from "node-vibrant";
import getRandomInt, { outputEmbed } from "../../utils/generic";

class JD extends Command implements CommandInterface {
  JDPics: string[];
  lastImageURL: null | string;
  pics: any;
  constructor(client: BotClient) {
    super(client, {
      name: "jd",
      description: "Send a random picture of a polish Ork",
      usage: "<prefix>jd",
      aliases: ["orkpls", "jebacdisa"],
      category: "Fun",
    });
    this.JDPics = [
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
    this.lastImageURL = null;
  }

  getImage(index: number): string {
    return this.JDPics[index];
  }

  async run(msg: Message) {
    let chosenImageUrl: string | null = null;
    let timesLooped = 0;

    while (!chosenImageUrl) {
      timesLooped++;
      if (timesLooped > 100) {
        return outputEmbed(
          msg.channel,
          "Program tries to pick different image every time. This error means that theres only 1 image in array.",
          {
            color: this.client.config.colors.warn,
            title: "Infinite loopy loopy happened",
          }
        );
      }
      let randomImage = this.getImage(getRandomInt(0, this.JDPics.length - 1));
      if (randomImage === this.lastImageURL) continue;
      chosenImageUrl = randomImage;
    }

    this.lastImageURL = chosenImageUrl;

    let palette;
    await Vibrant.from(chosenImageUrl)
      .getPalette()
      .then((_palette) => {
        palette = _palette;
      });

    const embed = new MessageEmbed()
      .setTitle(`Jebać Disa!`)
      .setImage(chosenImageUrl)
      .setColor(palette ? palette.Vibrant.hex : "#1b1b1b")
      .setFooter("I really need more pics of him. Pls DM me some");

    msg.channel.send(embed);
  }
}

module.exports = JD;
