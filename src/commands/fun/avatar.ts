import { Collection, ImageSize, Message, MessageEmbed, User } from "discord.js";
import outputEmbed from "../../utils/outputEmbed";

const avatarCommand = (msg: Message, mentionedUsers?: Collection<string, User>) => {
  let defaultImageSize: ImageSize = 1024;
  let userRequestedSize: any = null;
  let avatarUrl: string = "";
  let matchedImageSize: string = msg.content.match(/--size=\S{1,}/g)?.shift();
  //parse --size flag (optional)
  if (matchedImageSize) {
    let matchedImageSizeAsNumber: number = Number(matchedImageSize.substring(7));
    if (isNaN(matchedImageSizeAsNumber)) {
      outputEmbed(`Your **--size** flag is invalid. It's not a number`, msg, "error");
      return;
    }
    if (![16, 32, 64, 128, 256, 512, 1024, 2048].includes(matchedImageSizeAsNumber)) {
      outputEmbed(
        `Your **--size** flag is invalid. You can only request sizes: 16, 32, 64, 128, 256, 512, 1024, 2048`,
        msg,
        "error"
      );
      return;
    }
    userRequestedSize = matchedImageSizeAsNumber;
  }
  //parse mentioned users (optional, if no one is mentioned use message author)
  if (mentionedUsers.size === 0) {
    avatarUrl = msg.author.avatarURL({
      size: userRequestedSize ? userRequestedSize : defaultImageSize,
    });
  } else {
    avatarUrl = mentionedUsers.first().avatarURL({
      size: userRequestedSize ? userRequestedSize : defaultImageSize,
    });
  }

  const embed = new MessageEmbed()
    .setTitle(
      `Avatar | ${
        mentionedUsers.size ? mentionedUsers.values().next().value.tag : msg.author.tag
      }`
    )
    .setImage(avatarUrl);

  msg.channel.send(embed);
};

export default avatarCommand;
