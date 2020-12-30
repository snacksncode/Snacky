import {
  TextChannel,
  GuildMember,
  PermissionString,
  DMChannel,
  NewsChannel,
  User,
  MessageEmbed,
  BotClient,
  Message,
  EmbedFieldData,
} from "discord.js";
import { inspect } from "util";

//this one is yoinked from stackoverflow <3 (I've only added types)
//used in play function to push some songs to front
export function moveItemInArrayFromIndexToIndex<T>(
  array: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  if (fromIndex === toIndex) return array;

  const newArray = [...array];

  const target = newArray[fromIndex];
  const inc = toIndex < fromIndex ? -1 : 1;

  for (let i = fromIndex; i !== toIndex; i += inc) {
    newArray[i] = newArray[i + inc];
  }

  newArray[toIndex] = target;

  return newArray;
}

//both max and min are inclusive
//min 0, max 3 will produce one of the following: 0,1,2,3
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
export default getRandomInt;

//lorem -> Lorem
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

//this is just used to make stuff easier to read
//will remove the "prefix" from beginning of message
export function removePrefix(messageContent: string, prefix: string): string {
  return messageContent.substr(prefix.length);
}

//also used to make things easier to read
type destType = TextChannel | DMChannel | NewsChannel | User;
export async function sendMsg(dest: destType, msg: MessageEmbed | string) {
  return dest.send(msg);
}

//used by eval function to split messages longer than 2000 char into smaller ones
export function splitMsgOnLimit(input: string, limit: number): string[] {
  let output: string[] = [];
  while (input.length) {
    output.push(input.substr(0, limit));
    input = input.substr(limit);
  }
  return output;
}

//very useful embeds "factory"
interface EmbedOptions {
  color?: string;
  title?: string;
  fields?: EmbedFieldData[];
  footerText?: string;
  includeTimestamp?: boolean;
}
export async function outputEmbed(dest: destType, message: string, options: EmbedOptions) {
  const { color, title, fields, includeTimestamp, footerText } = options;
  const embed: MessageEmbed = new MessageEmbed().setDescription(message).setColor("#1b1b1b");

  if (fields) embed.addFields(fields);
  if (title) embed.setTitle(title);
  if (color) embed.setColor(color);
  if (footerText) embed.setFooter(footerText);
  if (includeTimestamp) embed.setTimestamp();

  const sentMessage = await sendMsg(dest, embed);
  return [sentMessage, embed] as [Message, MessageEmbed];
}

//used to indicate if command was successful (primarily used in mod commands)
//might strip this one
type StateString = "success" | "error";
export function stateReact(msg: Message, state: StateString, client: BotClient) {
  const reactionEmojis = client.config.reactionEmojis;
  const successEmoji = getEmojiByName(reactionEmojis[state].name, client);
  return msg.react(successEmoji);
}

//finds non-custom emoji by name
export function getEmojiByName(name: string, client: BotClient) {
  return client.emojis.cache.find((emoji) => emoji.name === name);
}

//formats amount in milliseconds to "H hrs, M min, S sec"
export function formatMs(ms: number) {
  let seconds: number = Math.floor((ms / 1000) % 60);
  let minutes: number = Math.floor((ms / (1000 * 60)) % 60);
  let hours: number = Math.floor((ms / (1000 * 60 * 60)) % 24);

  if (hours) return `${hours} hrs, ${minutes} min, ${seconds} sec`;
  else if (minutes) return `${minutes} min, ${seconds} sec`;
  else return `${seconds} sec`;
}

//also used by eval command to output objects properly
export function convertObjectToString(obj: object): string {
  return inspect(obj);
}

//checks member agains an array of permissions and returns the ones member lacks
export function getMissingPermissions(
  perms: PermissionString[],
  member: GuildMember
): PermissionString[] {
  const missingPerms: PermissionString[] = [];
  for (let permission of perms) {
    if (!member.hasPermission(permission)) {
      missingPerms.push(permission);
    }
  }
  return missingPerms;
}

//Thank you stackoverflow. At least I added typing myself haha
export function paginateArray<T>(array: T[], pageSize: number, pageNumber: number): T[] {
  return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}
