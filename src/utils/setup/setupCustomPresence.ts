import { BotClient } from "discord.js";

function setupCustomPresence(client: BotClient) {
  client.user.setPresence({
    activity: {
      name: `${client.config.prefix}help | ver. ${client.config.version}`,
      type: "LISTENING",
    },
    status: "online",
  });
}

export default setupCustomPresence;
