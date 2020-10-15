import * as fs from 'fs';
let configFileDir = `./config.json`

let fileExists = fs.existsSync(configFileDir);
let data: string = (fileExists) ? fs.readFileSync(configFileDir, 'utf-8') : "{token:null}";

export let token: string = JSON.parse(data).token || process.env.TOKEN;
export let prefix: string = "s!";
export let version: string = "1.2 Beta"