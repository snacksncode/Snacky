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
  const isRunningLocally = process.env.SHOW_LOCALHOST === "enabled";
  const embed: MessageEmbed = new MessageEmbed().setDescription(message).setColor("#1b1b1b");

  if (fields) embed.addFields(fields);
  if (title) embed.setTitle(title);
  if (color) embed.setColor(color);
  if (footerText) {
    let _footerText = footerText;
    if (isRunningLocally) _footerText += " | Bot is under development";
    embed.setFooter(_footerText);
  } else {
    if (isRunningLocally) embed.setFooter(`Bot is under development`);
  }
  if (includeTimestamp) embed.setTimestamp();

  const sentMessage = await sendMsg(dest, embed);
  return [sentMessage, embed] as [Message, MessageEmbed];
}

//used to indicate if command was successful (primarily used in mod commands)
//might strip this one
type StateString = "success" | "error";
export function stateReact(msg: Message, state: StateString, client: BotClient) {
  const reactionEmojis = client.config.reactionEmojis;
  const successEmoji = getEmojiById(reactionEmojis[state], client);
  return msg.react(successEmoji);
}

//finds non-custom emoji by id
export function getEmojiById(id: string, client: BotClient) {
  return client.emojis.cache.get(id);
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

export function swapElementsInArray(arr: any[], indexA: number, indexB: number) {
  let arrCopy = arr.slice();
  var temp = arrCopy[indexA];
  arrCopy[indexA] = arrCopy[indexB];
  arrCopy[indexB] = temp;
  return arrCopy;
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

//Jeez don't we all love stackoverflow? Types added
export function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length;
  let temporaryValue: T = null;
  let randomIndex = -1;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

//map numbers between ranges
export function mapNumber(
  num: number,
  in_min: number,
  in_max: number,
  out_min: number,
  out_max: number
): number {
  return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}
