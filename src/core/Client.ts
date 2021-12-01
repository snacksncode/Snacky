import { Client, Collection } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import FastGlob from "fast-glob";
import path from "path";

import { Command } from "../interfaces/Command";
import { Config } from "../interfaces/Config";
import { EventObject } from "../interfaces/Event";

import logger from "./logger";

const NAMESPACE = "Client";

export class Snacky extends Client {
  commands: Collection<string, Command>;
  config: Config;
  srcDir: string;
  logger: typeof logger;
  restAPI: REST;

  constructor(config: Config) {
    super(config.clientOptions);
    this.config = config;
    this.srcDir = path.join(__dirname, "../");
    this.commands = new Collection();
    this.logger = logger;
    this.restAPI = new REST({ version: "9" }).setToken(this.config.token);
    this.init();
  }

  private async init() {
    this.logger.info(NAMESPACE, "Client has started initialization");
    this.logger.info(NAMESPACE, "Logging in...");
    this.on("ready", async (client) => {
      this.logger.info(NAMESPACE, `Successfully logged in as ${client.user.tag}`);
      await this.initEvents();
      await this.initCommands();
    });
    await this.login(this.config.token);
  }

  private async initEvents() {
    const eventPaths = await this.findFiles(this.config.eventsPath);
    eventPaths.forEach((path) => {
      const {
        event: { name, listener, once },
      } = require(path) as { event: EventObject<any> };
      const client = this;
      const runOnce = once === true;
      const callback = (...agrs: any[]) => {
        listener(client, ...agrs);
      };
      if (runOnce) {
        this.logger.debug(NAMESPACE, `Setting up ${name} event to run once`);
        this.once(name, callback);
      } else {
        this.logger.debug(NAMESPACE, `Setting up ${name} event to run everytime`);
        this.on(name, callback);
      }
    });
    this.logger.info(NAMESPACE, `Successfully loaded events`);
  }

  private async initCommands() {
    const commandsPaths = await this.findFiles(this.config.commandsPath);
    for (const commandPath of commandsPaths) {
      const { command }: { command: Command } = require(commandPath);
      this.commands.set(command.data.name, command);
    }
    this.logger.info(NAMESPACE, `Successfully loaded commands`);
    if (process.env.DEPLOY_LOCALLY === "1") {
      this.pushCommandsLocally(this.config.debugGuildId);
    }
    if (process.env.DEPLOY_GLOBALLY === "1") {
      this.pushCommandsGlobally();
    }
    if (process.env.REMOVE_ALL === "1") {
      this.removeAllCommands(this.config.debugGuildId);
    }
  }

  private async findFiles(fileMatchingPattern: string): Promise<string[]> {
    return await FastGlob(fileMatchingPattern, { cwd: this.srcDir, absolute: true });
  }

  private async removeAllCommands(serverId: string) {
    if (this.user == null) return;
    try {
      await this.restAPI.put(Routes.applicationGuildCommands(this.user.id, serverId), { body: [] });
      await this.restAPI.put(Routes.applicationCommands(this.user.id), { body: [] });
      this.logger.info(NAMESPACE, "Successfully cleared both global and local slash commands");
    } catch (e) {
      this.logger.error(NAMESPACE, e);
    }
  }

  private async pushCommandsLocally(serverId: string) {
    if (this.user == null) return;

    const commandsJSONData = this.commands.map((command) => {
      return command.data.toJSON();
    });

    this.restAPI
      .put(Routes.applicationGuildCommands(this.user.id, serverId), { body: commandsJSONData })
      .then(() => this.logger.info(NAMESPACE, "Successfully registered local slash commands"))
      .catch((e) => this.logger.error(NAMESPACE, e));
  }

  private async pushCommandsGlobally() {
    if (this.user == null) return;

    const commandsJSONData = this.commands.map((command) => {
      return command.data.toJSON();
    });

    this.restAPI
      .put(Routes.applicationCommands(this.user.id), { body: commandsJSONData })
      .then(() => this.logger.info(NAMESPACE, "Successfully registered global slash commands"))
      .catch((e) => this.logger.error(NAMESPACE, e));
  }
}
