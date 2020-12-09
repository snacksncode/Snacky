import { Song } from "discord.js";

function getTotalLengthOfSongs(songs: Song[]): number {
  return songs.reduce((acc, curr) => acc + curr.length, 0);
}
export default getTotalLengthOfSongs;
