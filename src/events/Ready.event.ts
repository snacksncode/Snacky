import { BotClient, Event } from "discord.js";
import EventBase from "../base/Event";
import consoleColor from "colors";

class ReadyEvent extends EventBase implements Event {
  constructor(client: BotClient) {
    super(client, {
      eventName: "ready",
    });
  }
  async setupCustomPresence() {
    const presenceText = `${this.client.config.prefix}help • ver. ${this.client.config.version}`;
    await this.client.user.setPresence({
      activity: {
        name: presenceText,
        type: "LISTENING",
      },
      status: "online",
    });
  }
  async run() {
    await this.setupCustomPresence();
    this.client.logger.log(
      { name: "Client: Ready", color: "success" },
      `Bot has fully loaded and logged in as ${consoleColor.bold.yellow(this.client.user.tag)}`
    );
    const { enabled, intervalSec } = this.client.config._logApproximateMemoryUsage;
    if (enabled) {
      //Logging memory usage
      this.logMemoryUsage();
      setInterval(() => {
        this.logMemoryUsage();
      }, intervalSec * 1000);
    }
  }
  logMemoryUsage() {
    const used = process.memoryUsage();
    this.client.logger.log(
      {
        name: `Client: Memory Usage`,
        color: "info",
      },
      `Total Memory Allocated: ${this.getMB(used.rss)} | ${consoleColor.bold.blue(
        `Actual memory used: ${this.getMB(used.heapUsed)}`
      )} (${this.getMB(used.heapTotal)})`
    );
  }
  getMB(amountOfMemory: number): string {
    return `${(amountOfMemory / 1024 / 1024).toFixed(2)}MB`;
  }
}

module.exports = ReadyEvent;
