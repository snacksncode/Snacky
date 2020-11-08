import { Storage } from '../typings/storage';

let storage = {};

export const get = (index: string): Storage => storage[index];
export const set = (index: string, data: Storage | string | number) => storage[index] = Object.assign({}, data);

export const makeTemplate = (id: string) => storage[id] = Object.assign({}, {
    id,
    generated: new Date().toString(),
    isPlaying: false,
    channelId: null,
    joined: false,
    connection: null
});