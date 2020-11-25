import { inspect } from "util";

function convertObjectToString(obj: object): string {
  return inspect(obj);
}

export default convertObjectToString;
