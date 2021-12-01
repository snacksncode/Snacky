import { Command } from "../interfaces/Command";
import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";

const command: Command = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Check connection with bot"),
  run: (_client, interaction) => {
    if (!interaction) return;
    const embed = new MessageEmbed()
      .setTitle("Connection established!")
      .setColor("#76c893")
      .setFooter(`Took ${Math.abs(Date.now() - interaction.createdTimestamp)}ms`);
    interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

export { command };
