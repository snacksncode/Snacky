import { Message } from "discord.js";
import { reactionEmojis } from "../config";
import getEmojiByName from "./getEmojiByName";

type StateString = "success" | "error";

function stateReact(msg: Message, state: StateString) {
  const successEmoji = getEmojiByName(
    reactionEmojis[state === "success" ? "success" : "error"].name,
    msg.client
  );
  return msg.react(successEmoji);
}

export default stateReact;
