import { Song } from "discord.js";

function generateQueuePageString(page: Song[], songs: Song[]): string {
  let outputString: string = "";
  for (let song of page) {
    outputString += `${songs.indexOf(song) + 1}. [**${song.title}**](${song.url}) [${
      song.formattedLength
    }]\n`;
  }
  return outputString;
}

export default generateQueuePageString;
