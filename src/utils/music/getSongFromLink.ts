import { Message, Song } from "discord.js";
import ytdl from "ytdl-core";
import formatSongLength from "./formatSongLength";

async function getSongFromLink(url: string, msg: Message): Promise<Song> {
  const songInfo = await ytdl.getInfo(url);
  const songObject: Song = {
    id: songInfo.videoDetails.videoId,
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
    length: Number(songInfo.videoDetails.lengthSeconds),
    formattedLength: formatSongLength(Number(songInfo.videoDetails.lengthSeconds)),
    requestedBy: msg.author,
  };
  return songObject;
}

export default getSongFromLink;
