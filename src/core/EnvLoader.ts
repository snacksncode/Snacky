import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { error } from "./logger";

const NAMESPACE = "EnvLoader";

export class EnvLoader {
  public static load(rootPath: string) {
    dotenv.config();
    this.validate(process.env, rootPath);
  }
  private static checkIfExists(rootPath: string) {
    return fs.existsSync(path.join(rootPath, "/.env"));
  }
  private static validate(env: any, rootPath: string) {
    const dotEnvExists = this.checkIfExists(rootPath);
    if (env.TOKEN == null && !dotEnvExists) {
      error(NAMESPACE, ".env file might be missing in root folder");
      process.exit(1);
    }
    if (env.TOKEN == null) {
      error(NAMESPACE, "Token missing in .env file");
      process.exit(1);
    }
  }
}
