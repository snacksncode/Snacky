import { VoiceConnection } from "discord.js";

export interface Storage {
    id: string;
    generated: string;
    isPlaying: boolean;
    joined: boolean;
    channelId: string;
    connection: VoiceConnection;
}