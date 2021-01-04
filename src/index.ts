import "dotenv/config";
import config from "./config";
import Client from "./base/Client";
//setup global appRoot directory. This is used for relative file searches
global.appRoot = __dirname;
//initiate bot client
new Client({
  config: config,
}).init();
