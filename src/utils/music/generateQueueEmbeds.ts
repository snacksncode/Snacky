import { MessageEmbed, Song } from "discord.js";
import { colors } from "../../config";
import formatSongLength from "./formatSongLength";
import generateQueuePageString from "./generateQueuePageString";
import getTotalLengthOfSongs from "./getTotalLengthOfSongs";

//hank you stackoverflow. At least I added typing myself haha
function paginateArray<T>(array: T[], pageSize: number, pageNumber: number): T[] {
  return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}

function generateQueueEmbeds(songs: Song[], songsLimit: number): MessageEmbed[] {
  const queueEmbeds: MessageEmbed[] = [];
  const paginatedSongs: Song[][] = [];
  const amountOfPages: number = Math.ceil(songs.length / songsLimit);

  for (let pageNumber = 1; pageNumber <= amountOfPages; pageNumber++) {
    const arraySlice = paginateArray(songs, songsLimit, pageNumber);
    paginatedSongs.push(arraySlice);
  }

  for (let page of paginatedSongs) {
    const currentPage = paginatedSongs.indexOf(page) + 1;
    const pageEmbed = new MessageEmbed()
      .setTitle(`Music Queue`)
      .setColor(colors.info)
      .setDescription(generateQueuePageString(page, songs))
      .addFields([
        { name: "Number of tracks", value: songs.length, inline: true },
        {
          name: "Total length",
          value: formatSongLength(getTotalLengthOfSongs(songs)),
          inline: true,
        },
      ]);

    if (amountOfPages > 1) pageEmbed.setFooter(`Page: ${currentPage}/${amountOfPages}`);

    queueEmbeds.push(pageEmbed);
  }

  return queueEmbeds;
}

export default generateQueueEmbeds;
