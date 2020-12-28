import colors from "colors";
import { LoggerFlag, FlagColor, LoggerInterface } from "discord.js";

class Logger implements LoggerInterface {
  log(flag: LoggerFlag, message: string) {
    const coloredFlag = colors[this.getColor(flag.color)].bold(`[ ${flag.name} ]`);
    console.log(`${coloredFlag} ${message}`);
  }
  getColor(color: FlagColor): string {
    switch (color) {
      case "error":
        return "red";
      case "info":
        return "blue";
      case "success":
        return "green";
      case "warning":
        return "yellow";
    }
  }
}

export default Logger;
