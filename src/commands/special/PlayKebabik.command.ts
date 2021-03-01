import { Message, CommandInterface, BotClient, PlayCommandInterface } from "discord.js";
import Command from "../../base/Command";

class KebabikPls extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "kebabikpls",
      description: "Plays the playlist of a best local rapper",
      usage: "<prefix>kebabikpls [--nightcore] [--random]",
      hidden: true,
      category: "Music",
    });
  }
  async run(msg: Message) {
    const randomizePlaylist = !!msg.content.match(/--(random|randomize)/g)?.shift();
    const nightcoreFlag = !!msg.content.match(/--nightcore/g)?.shift();
    const playCommandObject = this.client.commands.get("play") as PlayCommandInterface;
    const playlistUrl = nightcoreFlag
      ? "https://youtube.com/playlist?list=PLDIhE97v42e7Ffj4FhZ9JnRUO5qMRex1V"
      : "https://youtube.com/playlist?list=PLDIhE97v42e6bQldgDg3DKeeHjKHM4xjv";
    playCommandObject.processPlaylist(playlistUrl, msg, false, randomizePlaylist);
  }
}

module.exports = KebabikPls;
