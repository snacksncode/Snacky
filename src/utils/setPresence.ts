import { Client } from "discord.js";
import { prefix, version } from "../config";

const setCustomPresence = (client: Client) => {
  client.user.setPresence({
    activity: {
      name: `Prefix: ${prefix} | Version: ${version}`,
      type: "PLAYING",
    },
    status: "online",
  });
};
export default setCustomPresence;
