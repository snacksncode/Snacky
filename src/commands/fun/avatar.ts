import { Collection, ImageSize, Message, MessageEmbed, User } from "discord.js";
import { colors } from "../../config";
import Vibrant from "node-vibrant";
import outputEmbed from "../../utils/outputEmbed";
import stateReact from "../../utils/stateReact";

const avatarCommand = async (msg: Message) => {
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
        color: colors.error,
        title: "Image size isn't a number",
      });
      return;
    }
    if (![128, 256, 512, 1024, 2048].includes(matchedImageSizeAsNumber)) {
      outputEmbed(
        msg.channel,
        `Your **--size** flag is invalid. You can only request sizes: 128, 256, 512, 1024, 2048`,
        {
          color: colors.error,
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

  const embed = new MessageEmbed()
    .setTitle(`Avatar | ${mentionedUsers.size ? mentionedUsers.first().tag : msg.author.tag}`)
    .setImage(avatarUrl)
    .setColor(palette ? palette.Vibrant.hex : colors.default);

  msg.channel
    .send(embed)
    .then((_) => {
      stateReact(msg, "success");
    })
    .catch((err) => {
      stateReact(msg, "error");
    });
};

export default avatarCommand;
