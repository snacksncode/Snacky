import { Client } from "discord.js";
import { prefix, version } from "../config";

const setupCustomPresence = (client: Client) => {
  client.user.setPresence({
    activity: {
      name: `${prefix}help | ver. ${version}`,
      type: "LISTENING",
    },
    status: "online",
  });
};

export default setupCustomPresence;
