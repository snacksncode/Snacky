import {
  Message,
  CommandInterface,
  BotClient,
  Collection,
  ImageSize,
  MessageEmbed,
  User,
} from "discord.js";
import Vibrant from "node-vibrant";
import Command from "../../base/Command";
import { outputEmbed, sendMsg } from "../../utils/generic";

class Help extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "avatar",
      aliases: ["av", "avtr", "pic"],
      description: "Shows your or mentioned member's avatar",
      usage: "<prefix>avatar [member?] [--size=avatarSize?]",
      category: "Information",
    });
  }

  async run(msg: Message) {
    const mentionedUsers: Collection<string, User> = msg.mentions.users;
    const defaultImageSize: ImageSize = 1024;
    let userRequestedSize: any = null;
    let avatarUrl: string = "";
    let matchedImageSize: string = msg.content.match(/--size=\S{1,}/g)?.shift();
    //parse --size flag (optional)
    if (matchedImageSize) {
      let matchedImageSizeAsNumber: number = Number(matchedImageSize.substring(7));
      if (isNaN(matchedImageSizeAsNumber)) {
        outputEmbed(msg.channel, `Your **--size** flag is invalid. It's not a number`, {
          color: this.client.config.colors.error,
          title: "Image size isn't a number",
        });
        return;
      }
      if (![128, 256, 512, 1024, 2048].includes(matchedImageSizeAsNumber)) {
        outputEmbed(
          msg.channel,
          `Your **--size** flag is invalid. You can only request sizes: 128, 256, 512, 1024, 2048`,
          {
            color: this.client.config.colors.error,
            title: "Wrong image size",
          }
        );
        return;
      }
      userRequestedSize = matchedImageSizeAsNumber;
    }
    //parse mentioned users (optional, if no one is mentioned use message author)
    if (mentionedUsers.size === 0) {
      avatarUrl = msg.author.avatarURL({
        size: userRequestedSize ? userRequestedSize : defaultImageSize,
        format: "png",
      });
    } else {
      avatarUrl = mentionedUsers.first().avatarURL({
        size: userRequestedSize ? userRequestedSize : defaultImageSize,
        format: "png",
      });
    }

    let palette;
    await Vibrant.from(avatarUrl)
      .getPalette()
      .then((_palette) => {
        palette = _palette;
      });

    const avatarEmbed = new MessageEmbed()
      .setTitle(`Avatar | ${mentionedUsers.size ? mentionedUsers.first().tag : msg.author.tag}`)
      .setImage(avatarUrl)
      .setColor(palette ? palette.Vibrant.hex : "#1b1b1b");

    sendMsg(msg.channel, avatarEmbed);
  }
}

module.exports = Help;
