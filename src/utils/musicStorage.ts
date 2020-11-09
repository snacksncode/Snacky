import { Storage } from "../typings/storage";

let storage: { [key: string]: Storage } = {};

export const get = (index: string): Storage => storage[index];
export const set = (index: string, data: Storage) => (storage[index] = Object.assign({}, data));

export const makeTemplate = (id: string) => {
  storage[id] = Object.assign({}, {
    id,
    generated: new Date().toString(),
    isPlaying: false,
    channelId: null,
    joined: false,
    connection: null,
    dispatcher: null,
    bassBoost: false,
    volume: 1.0,
    loop: false,
    timeout: 0,
    queue: [],
  } as Storage);
};
