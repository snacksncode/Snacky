import { EmbedFieldData } from "discord.js";

interface helpObject {
  Description: string;
  Aliases?: string;
  Usage: string;
  Example?: string;
}
function formatHelp(input: helpObject): EmbedFieldData[] {
  let output: EmbedFieldData[] = [];
  let entriesArray: string[][] = Object.entries(input);
  entriesArray.forEach(([_key, _value]) => {
    output.push({ name: _key, value: _value });
  });
  return output;
}
export default formatHelp;
