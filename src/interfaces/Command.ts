import { Awaitable, CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Snacky } from "../core/Client";

export interface Command {
  data: SlashCommandBuilder;
  permissions?: Array<string>;
  run: (client: Snacky, interaction: CommandInteraction) => Awaitable<void>;
}
