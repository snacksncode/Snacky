<p align="center">
  <img src="https://i.imgur.com/8uMInN6.png" alt="Avatar">
</p>
<h1 align="center">Snacky</h1>
<p align="center">My first ever Discord Bot written in TypeScript</p>

# Table of Contents

- [Features](#features)
- [Invite](#invite)
- [Running locally](#running)
- [Known issues](#issues)

<a name="features"><h1>Features</h1></a>

Snacky is a little bot that I've written for my own server and overall just for the sake of working with Discord.js, TypeScript and Node.js. It's not super complicated as of right now but I'll be adding features as I go.

### Avaible commands

| Category    | Commands                                                                   |
| ----------- | -------------------------------------------------------------------------- |
| Information | avatar, help, ping, uptime                                                 |
| Moderation  | clear, mute, unmute                                                        |
| Music       | play, queue, shuffle, skip, loop, stop, earrape, nowplaying, pause, resume |
| Fun         | roll, jd                                                                   |

<a name="invite"><h1>Invite Snacky to your discord server</h1></a>

You can use [this](https://discord.com/oauth2/authorize?client_id=765660664956977182&scope=bot&permissions=8) link to invite him to your server. Currently bot has only one instance running on Heroku. Sometimes when I'm developing new features he'll be offline.

<a name="running"><h1>Running Snacky locally</h1></a>

If you for some reason want to get your own version of the bot up and running you can use this section to guide you.

1. Go to [Discord's Dev Portal](https://discord.com/developers) and create a new application there. Then add a bot to this application and copy your bot token from there.
2. Clone Snacky's code and install all needed packages

```bash
# by using yarn
yarn install
# or npm
npm install
```

Also create a `.env` file in root directory with those contents

```
TOKEN_STABLE=[PUT YOUR TOKEN HERE]
```

After that your own instance of the bot should be ready to launch. To start the bot just use the start script.

```bash
yarn start
# or
npm start
```

Don't forgot to invite him to your testing server.<br/>
<sup>If you're on windows you might get an error about `ts-node` not being defined. In this case install this package globally</sup>

<a name="issues"><h1>Known issues</h1></a>

1. ~~Pausing works but resuming doesn't.~~
   **Fixed!** Had to switch to LTS version of NodeJS. Version 15 was causing problems for some reason, version 14 on the other hand doesn't

2. Because Snacky is hosted on Heroku. Sometimes after bot has been playing music for a long time heroku "clears" websocket connections and the bot stops playing. In this case whilst still in voice chat use `stop` command to disconnect him and then add songs back to queue. I'll implement a command that will "rescue" the queue in this case.
