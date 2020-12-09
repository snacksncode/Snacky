import { Client, GuildMusicQueue } from "discord.js";

export const getQueue = (guildId: string, client: Client): GuildMusicQueue => {
  return client.guildsQueue.get(guildId);
};

export const setQueue = (guildId: string, client: Client, newGuildQueueData: GuildMusicQueue) => {
  return client.guildsQueue.set(guildId, newGuildQueueData);
};

export const createQueue = (guildId: string, client: Client) => {
  const defaultQueueObject: GuildMusicQueue = {
    textChannel: null,
    voiceChannel: null,
    connection: null,
    songs: [],
    volume: 1.0,
    bassboost: false,
    isPlaying: false,
  };

  client.guildsQueue.set(guildId, defaultQueueObject);

  return client.guildsQueue.get(guildId);
  // storage[id] = Object.assign({}, {
  //   id,
  //   generated: new Date().toString(),
  //   isPlaying: false,
  //   channelId: null,
  //   joined: false,
  //   connection: null,
  //   dispatcher: null,
  //   bassBoost: false,
  //   volume: 1.0,
  //   loop: false,
  //   timeout: 0,
  //   queue: [],
  // } as Storage);
};
