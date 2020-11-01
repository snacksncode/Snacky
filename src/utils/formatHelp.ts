import { ImportsNotUsedAsValues } from "typescript";

interface helpObject {
  Description: string;
  Aliases?: string;
  Usage: string;
  Example?: string;
}
function formatHelp(input: helpObject) {
  return "Help here lol";
}
export default formatHelp;
