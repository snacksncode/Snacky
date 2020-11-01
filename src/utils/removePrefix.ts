import { prefix } from "../config";

function removePrefix(messageContent: string): string {
  return messageContent.substr(prefix.length);
}

export default removePrefix;
