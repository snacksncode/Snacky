import { StreamDispatcher, VoiceConnection } from "discord.js";

export interface Storage {
    id: string;
    generated: string;
    isPlaying: boolean;
    joined: boolean;
    channelId: string;
    loop: boolean;
    dispatcher: StreamDispatcher;
    connection: VoiceConnection;
    bassBoost: boolean;
    volume: number;
    timeout: any;
    queue: Array<Song>;
}

export interface Song {
    name: string;
    author: string;
    url: string;
    thumbnail: string;
    length: string;
}