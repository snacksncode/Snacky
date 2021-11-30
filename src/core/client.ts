import { ApplicationCommandData, Client, GuildMember, MessageEmbed, Permissions, TextBasedChannels } from "discord.js";
import { lstatSync, readdirSync } from "fs";
import { join } from "path";
import { Command, CommandType } from "../interfaces/Command";
import logger from "./logger";

export class Snacky {
  private commands: Map<string, Command>;
  private client: Client;
  private prefix: string;

  constructor(client: Client, prefix: string = "!") {
    this.commands = new Map<string, Command>();
    this.client = client;
    this.prefix = prefix;

    try {
      logger.info(`[Snacky] ${this._load("../commands/")} commands loaded.`);
    } catch (error) {
      logger.info("[Snacky] No commands loaded.");
      logger.error(error);
      return;
    }
    this._registerSlashCommands();
    this._listen();
  }

  /**
   * Recursive inner function to call the commands from the given directory
   * @param {string} dir directory to load from
   * @returns {number} sum of loaded commands
   */
  _load(dir: string): number {
    let count = 0;
    // recursively read directory for commands
    const files = readdirSync(join(__dirname, dir));
    for (const file of files) {
      const stat = lstatSync(join(__dirname, dir, file));
      if (stat.isDirectory()) {
        count += this._load(join(dir, file));
      } else {
        if (file.startsWith(".")) continue;
        const command = require(join(__dirname, dir, file));
        // call the command
        this._register(command);
        ++count;
      }
    }
    return count;
  }

  /**
   * Provisions all commands to the guilds.
   */
  async _registerSlashCommands(): Promise<void> {
    const debugGuild = process.env.GUILD || "";

    if (this.client === null) return;
    const slashCommands: Array<ApplicationCommandData> = [];

    this.commands.forEach((command) => {
      if (typeof command.type === "undefined" || command.type === CommandType.NORMAL) return;
      slashCommands.push({
        name: command.name,
        description: command.description,
        options: command.options,
      } as ApplicationCommandData);
    });

    // skip the rest if there are no commands to add.
    if (slashCommands.length === 0) return;

    try {
      let commands = undefined;
      // provision per guild
      const guild = this.client.guilds.cache.get(debugGuild);
      // guild?.commands.fetch().then((cmds) => {
      //   cmds.forEach(async (cmd) => {
      //     const { id } = cmd;
      //     logger.info(`Removing command: ${cmd.name}`);
      //     await guild.commands.delete(id);
      //   });
      // });
      if (guild) {
        commands = guild.commands;
      } else {
        commands = this.client.application?.commands;
      }
      for (const command of slashCommands) {
        commands?.create(command);
      }
      logger.info("[Snacky] Successfully reloaded LexBot (/) commands.");
    } catch (error) {
      console.error(error);
    }
  }

  private _register(command: Command): void {
    if (command.permissions) {
      for (const permission of command.permissions) {
        if (!Permissions.FLAGS.hasOwnProperty(permission)) return;
      }
    }
    this.commands.set(command.name, command);
  }

  // help(channel: TextBasedChannels, member: GuildMember): void {
  //   const printCommand = (command: Command): string => {
  //     if (command.type === CommandType.SLASH) return "";

  //     const args = command.expectedArgs ? ` ${command.expectedArgs}` : "";
  //     const description = command.description ? `, ${command.description}` : "";
  //     const aliases = command.aliases
  //       ? `, aliases: \`${this.prefix}${command.aliases.join(`\`, \`${this.prefix}`)}\``
  //       : "";
  //     return `\`${this.prefix}${command.name}${args}\`${aliases}${description}\n`;
  //   };

  //   const commandCategories = new Map<string, Array<Command>>();
  //   for (const [name, command] of this.commands.entries()) {
  //     const [hasPermission, permissionName] = this._checkPermissions(command, member);
  //     // check for permissions
  //     if (!hasPermission) continue;

  //     // check if user has required roles or is administrator
  //     const [hasRole, roleName] = this._checkRoles(command, member);
  //     if (!hasRole) continue;

  //     // add
  //     const categorylist = commandCategories.get(command.category) || [];
  //     categorylist.push(command);

  //     commandCategories.set(command.category, categorylist);
  //   }

  //   const embed = new MessageEmbed().setColor("#00AAFF").setTitle("Supported Commands");

  //   for (const [category, commandList] of commandCategories.entries()) {
  //     let cmdpcat = "";
  //     for (const command of commandList) cmdpcat += printCommand(command);
  //     embed.addField(category, cmdpcat);
  //   }

  //   channel.send({ embeds: [embed] });
  // }

  private _checkPermissions(command: Command, member: GuildMember): [boolean, string | undefined] {
    if (!command.permissions) return [true, undefined];

    const userPermissions = member.permissions.toArray().map((p) => `${p}`);
    for (const permission of command.permissions) {
      if (!userPermissions.includes(permission)) return [false, permission];
    }

    return [true, undefined];
  }

  private _checkRoles(command: Command, member: GuildMember): [boolean, string | undefined] {
    if (!command.roles) return [true, undefined];

    for (const roleName of command.roles) {
      const cmdRole = member.guild.roles.cache.find((role) => role.name === roleName);

      if (
        (!cmdRole || !member.roles.cache.has(cmdRole.id)) &&
        !member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
      ) {
        return [false, roleName];
      }
    }
    return [true, undefined];
  }

  private _canUseCommand(command: Command, member: GuildMember): [boolean, string | undefined] {
    // check permissions
    const [hasPermission, permissionName] = this._checkPermissions(command, member);
    if (!hasPermission) {
      return [false, `You don't have the permission ${permissionName} to use this command.`];
    }

    // check roles
    const [hasRole, roleName] = this._checkRoles(command, member);
    if (!hasRole) {
      return [false, `You must have the "${roleName}" role to use this command.`];
    }
    return [true, undefined];
  }

  private _listen(): void {
    this.client.on("messageCreate", (message) => {
      const { member, content, guild, channel } = message;
      if (member === null) return;
      if (guild === null) return;
      if (!content.startsWith(this.prefix)) return;
      // split command on spaces
      const args = content.split(/[ ]+/);
      if (args === undefined) return;
      console.log("here");

      // get the command name
      const cmd = args.shift()!.toLowerCase().replace(this.prefix, "");

      let command = this.dummyCommand;
      this.commands.forEach((eeeee) => {
        if (eeeee.name === cmd || eeeee.aliases?.includes(cmd)) {
          command = eeeee;
          return;
        }
      });
      // command not found
      if (command.name === this.helpCommand.name) {
        this.help(channel, member);
        return;
      }

      // stop listening if slash command
      if (command.type === CommandType.SLASH) return;

      const [canUseCommand, errorMessage] = this._canUseCommand(command, member);
      if (!canUseCommand) {
        channel.send(`${errorMessage}`);
        return;
      }

      // check number of arguments
      const { minArgs, maxArgs, expectedArgs } = command;
      if ((minArgs !== undefined && args.length < minArgs) || (maxArgs !== undefined && args.length > maxArgs)) {
        channel.send(`Incorrect usage! Use \`${this.prefix}${`${command.name} ${expectedArgs || ""}`.trimEnd()}\``);
        return;
      }

      // handle command
      command.run({ member, message, args });
    });

    this.client.on("interactionCreate", async (interaction) => {
      if (!interaction.isCommand()) return;

      // check if Member exists and is guild member
      const { member } = interaction;
      if (!member) return;
      if (!(member instanceof GuildMember)) return;

      const command = this.commands.get(interaction.commandName);
      // command not found
      if (!command) {
        interaction.reply(`Slashcommand \`${interaction.commandName}\` not found.`);
        return;
      }

      if (typeof command.type === "undefined" || command.type === CommandType.NORMAL) {
        interaction.reply(`Slashcommand \`${interaction.commandName}\` found but not configured.`);
        return;
      }

      const [canUseCommand, errorMessage] = this._canUseCommand(command, member);
      if (!canUseCommand) {
        interaction.reply(`${errorMessage}`);
        return;
      }
      command.run({ interaction, member });
    });
  }
}
