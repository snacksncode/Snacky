import { EventObject } from "../interfaces/Event";

const NAMESPACE = "Event:interactionCreate";

const event: EventObject<"interactionCreate"> = {
  name: "interactionCreate",
  listener: async (client, interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.run(client, interaction);
    } catch (error) {
      client.logger.error(NAMESPACE, `Failed executing command ${interaction.commandName}`);
      await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
    }
  },
};

export = { event };
