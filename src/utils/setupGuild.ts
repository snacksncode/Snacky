import { Client } from "discord.js";
import { makeTemplate } from "./musicStorage";
import consoleColors from "colors";
import setupReactionEmojis from "./setupReactionEmojis";

function setupGuild(client: Client) {
  const guilds = client.guilds;
  console.log(`${consoleColors.dim.bold(`[ Started guilds initiation process ]`)}`);
  guilds.cache.forEach((guild) => {
    console.log(
      `${consoleColors.blue("[ Guild ]")} Configuring ${consoleColors.blue(
        guild.name
      )} | ${consoleColors.dim(guild.id)}`
    );
    makeTemplate(guild.id);
    setupReactionEmojis(guild);
  });
}

export default setupGuild;
