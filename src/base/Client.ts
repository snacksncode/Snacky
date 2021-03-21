import {
  Client,
  BotClient,
  ClientOptions,
  Collection,
  CommandInterface,
  Config,
  Event,
} from "discord.js";
import fg from "fast-glob";
import path from "path";
import { capitalizeFirstLetter } from "../utils/generic";
import DatabaseManager from "./DatabaseManager";
import Logger from "./Logger";
import MusicPlayer from "./MusicPlayer";

//interfaces
interface InternalClientOptions {
  config: Config;
  clientOptions?: ClientOptions;
}

//Client class
class CustomClient extends Client implements BotClient {
  client: Client;
  config: Config;
  logger: Logger;
  player: MusicPlayer;
  database: DatabaseManager;
  commands: Collection<string, CommandInterface>;

  constructor(options: InternalClientOptions) {
    //initiate the original DiscordClient with options if passes
    super(options.clientOptions || {});
    this.commands = new Collection(); //commands holder
    this.logger = new Logger(); //just a class to log things nicely
    this.config = options.config; //this will store config file
    //create music player
    this.player = new MusicPlayer(this);
    this.database = new DatabaseManager(this);
    //log that client has been created
    this.logger.log({ name: "Node: Version", color: "warning" }, process.version);
    this.logger.log({ name: "Client: Start", color: "info" }, `Created client`);
  }

  async _loadClasses(type: "command" | "event", pathToLoadFrom: string) {
    let failedToLoad: string[] = [];
    const entries = await fg(pathToLoadFrom); //fast-glob
    entries.forEach((file) => {
      try {
        const loadedClass: Event | CommandInterface = new (require(file))(this);
        if (type === "command") {
          let c = loadedClass as CommandInterface;
          this.commands.set(c.commandName, c);
        } else if (type === "event") {
          //type is "events"
          let e = loadedClass as Event;
          if (e.ignoreEvent) return;
          super.on(e.eventName, async (...args) => {
            try {
              await e.run(...args);
            } catch (err) {
              this.logger.log({ name: "Event runtime error", color: "error" }, `\n${err.stack}`);
            }
          });
        } else {
          throw new Error("_loadClasses() was invoked with incorrect type");
        }
      } catch (err) {
        const loadedClassName = path.parse(file).name.replace(`.${type}`, "");
        failedToLoad.push(loadedClassName);
        this.logger.log(
          {
            name: `Error occured during loading of ${loadedClassName} ${type}`,
            color: "error",
          },
          `\n${err.stack}`
        );
      }
    });
    if (failedToLoad.length === 0) {
      this.logger.log(
        { name: `Loader: ${capitalizeFirstLetter(type)}s`, color: "success" },
        `Successfully loaded all ${type}s`
      );
    } else {
      this.logger.log(
        { name: `Loader: ${capitalizeFirstLetter(type)}s`, color: "error" },
        `Failed to load ${failedToLoad.toString()} ${type}(s)`
      );
    }
  }

  async _loadEvents(eventsPath: string) {
    await this._loadClasses("event", eventsPath);
  }

  async _loadCommands(commandsPath: string) {
    await this._loadClasses("command", commandsPath);
  }

  async _login(_token: string) {
    //super is used to access the original login() function of DiscordClient
    return await super.login(_token);
  }

  async init() {
    this.logger.log({ name: "Client: Init", color: "info" }, "Started initiation process");
    await this._loadCommands(path.join(global.appRoot, this.config.paths.commands));
    await this._loadEvents(path.join(global.appRoot, this.config.paths.events));
    await this.database.testConnection();
    await this._login(this.config.token);
  }
}

export default CustomClient;
