import Discord, { TextChannel } from "discord.js";
import { token } from "./config";
import parseMessage from "./utils/parseMessage";
import express from "express";

const client = new Discord.Client();
const app = express();

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/client/index.html`);
});

app.get("/style.css", (req, res) => {
  res.sendFile(`${__dirname}/client/style.css`);
});

app.listen(process.env.PORT || 3000);

client.on("ready", () => {
  console.log(`[ Ready ] Logged in as ${client.user.tag}!`);
});

client.on("message", (msg) => {
  if (msg.author.bot || msg.system || msg.channel.type !== "text") return;
  let channel: TextChannel = msg.channel;
  parseMessage(msg, channel);
});

client.login(token);
