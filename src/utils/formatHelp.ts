import { EmbedFieldData, FormatHelpInput } from "discord.js";

function userFriendlyName(name: string) {
  switch (name) {
    case "desc":
      return "Description";
    case "aliases":
      return "Avaible aliases";
    case "usage":
      return "Usage";
    case "example":
      return "Example";
    case "reqPerms":
      return "Required permissions";
  }
}

function formatHelp(input: FormatHelpInput): EmbedFieldData[] {
  let output: EmbedFieldData[] = [];
  let entriesArray: string[][] = Object.entries(input);
  entriesArray.forEach(([_key, _value]) => {
    output.push({ name: userFriendlyName(_key), value: _value });
  });
  return output;
}
export default formatHelp;
