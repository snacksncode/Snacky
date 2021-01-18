import { Message, CommandInterface, BotClient } from "discord.js";
import Command from "../../base/Command";

class Pause extends Command implements CommandInterface {
  constructor(client: BotClient) {
    super(client, {
      name: "kebabikpls",
      description: "Plays the playlist of a best local rapper",
      usage: "<prefix>kebabik",
      hidden: true,
      category: "Music",
    });
  }
  async run(msg: Message) {
    //Fake play command exec
    const modifiedMsgObject = msg;
    const playlistLink = "https://youtube.com/playlist?list=PLDIhE97v42e6bQldgDg3DKeeHjKHM4xjv";
    modifiedMsgObject.content = `${this.client.config.prefix}play ${playlistLink}`;
    this.client.emit("message", modifiedMsgObject);
  }
}

module.exports = Pause;
