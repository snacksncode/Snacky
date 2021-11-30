import dotenv from "dotenv";
import { error } from "./logger";

export class EnvLoader {
  public static load() {
    dotenv.config();
    this.validate(process.env);
  }
  private static validate(env: any) {
    if (env.TOKEN == null) {
      throw error("Token missing in .env file");
    }
  }
}
