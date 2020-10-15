import Discord, { TextChannel } from 'discord.js';
import { token } from './config';
import parseMessage from './utils/parseMessage';
import express from 'express';

const client = new Discord.Client();
const app = express();

app.get("/", (req, res) => {
  res.send("Works?");
})

app.listen(process.env.PORT || 3000);

client.on('ready', () => {
  console.log(`\x1b[32m[ Ready ]\x1b[0m Logged in as \x1b[34m${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.author.bot || msg.system || msg.channel.type !== "text") return;
  let channel: TextChannel = msg.channel;
  parseMessage(msg, channel)
});

client.login(token);