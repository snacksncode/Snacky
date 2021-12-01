import { Awaitable, ClientEvents } from "discord.js";
import { Snacky } from "../core/Client";

type EventListener<K extends keyof ClientEvents> = (client: Snacky, ...args: ClientEvents[K]) => Awaitable<void>;

export interface EventObject<K extends keyof ClientEvents> {
  name: K;
  listener: EventListener<K>;
  once?: boolean;
}
