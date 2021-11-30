import { CommandType, CallbackOptions, Command } from "../interfaces/Command";

export = {
  name: "ping",
  type: CommandType.BOTH,
  description: "Sends back pong",
  options: [
    {
      type: "BOOLEAN",
      name: "hellu",
      description: "Description here hehe",
      required: true,
    },
  ],
  run: ({ interaction, message }: CallbackOptions) => {
    if (message != null) {
      message.channel.send("Pong! Good old messages");
      return;
    }
    if (!interaction) return;
    interaction.reply("Pong! That's new");
  },
} as Command;
