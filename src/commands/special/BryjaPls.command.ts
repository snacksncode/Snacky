import { Message, CommandInterface, BotClient, PlayCommandInterface } from "discord.js";
import Command from "../../base/Command";

class BryjaPls extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "bryjapls",
      description: "Plays the playlist of a ex-best local rapper",
      usage: "<prefix>bryjapls [--random]",
      hidden: true,
      category: "Music",
    });
  }
  async run(msg: Message) {
    const randomizePlaylist = !!msg.content.match(/--(random|randomize)/g)?.shift();
    const playCommandObject = this.client.commands.get("play") as PlayCommandInterface;
    const playlistUrl = "https://youtube.com/playlist?list=PLDIhE97v42e4aPwExPpkobwat1HuyjJK0";
    playCommandObject.processPlaylist(playlistUrl, msg, false, randomizePlaylist);
  }
}

module.exports = BryjaPls;
