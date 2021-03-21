// import colors from "colors";

import { BotClient, DatabaseManagerInterface } from "discord.js";
import mongoose from "mongoose";

class DatabaseManager implements DatabaseManagerInterface {
  client: BotClient;
  connection: mongoose.Connection | null;
  databaseURI: string;
  constructor(client: BotClient) {
    this.client = client;
    this.connection = null;
    this.databaseURI = `mongodb+srv://${this.client.config.database.user}:${this.client.config.database.password}@snackybot.qotec.mongodb.net/main?retryWrites=true&w=majority`;
  }
  async _connectToDatabase() {
    try {
      await mongoose.connect(this.databaseURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      this.connection = mongoose.connection;
    } catch (e) {
      this.client.logger.log(
        { name: "*Database: Connection", color: "error" },
        `Error connecting to database:\n${e.stack}`
      );
      return;
    }
  }
  async _closeConnection() {
    if (!this.connection) return;
    await this.connection.close();
  }
  async testConnection() {
    await this._connectToDatabase();
    if (this.connection) {
      this.client.logger.log(
        { name: "*Database: Testing", color: "success" },
        `Test connection to database was successful. Closing connection...`
      );
    }
  }
}

export default DatabaseManager;
