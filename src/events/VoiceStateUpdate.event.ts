import { BotClient, Event, VoiceState } from "discord.js";
import EventBase from "../base/Event";
import { outputEmbed } from "../utils/generic";

class VoiceStateUpdate extends EventBase implements Event {
  constructor(client: BotClient) {
    super(client, {
      eventName: "voiceStateUpdate",
    });
  }
  async run(oldVoiceState: VoiceState, newVoiceState: VoiceState) {
    //==========================================
    //Setup timeout when bot is left alone in VC
    //==========================================
    const DEFAULT_LEAVE_VC_IF_EMPTY_DELAY = 30000; //30s
    const guildQueue = this.client.player.guildsQueue.get(newVoiceState.guild.id);
    const player = this.client.player;
    //stop execution if server currently doesn't have music queue
    if (!guildQueue) return;
    if (
      oldVoiceState.channel !== newVoiceState.channel && //channels were changed
      newVoiceState.member.id !== this.client.user.id //it's not bot
    ) {
      //user left voice channel
      if (guildQueue.voiceChannel.id !== newVoiceState.channel?.id) {
        //if there is already a timeout clear old one before setting up a new one
        //if there is no timeout set this will contain null thus won't trigger if statement
        if (player.leaveVCTimeoutId) {
          clearTimeout(player.leaveVCTimeoutId);
          player.leaveVCTimeoutId = null;
        }
        if (!oldVoiceState.channel) {
          this.client.logger.log(
            { color: "warning", name: "Music Player: Debug" },
            `User's oldVoiceState.channel is missing. Logging stuff`
          );
          this.client.logger.log(
            { color: "warning", name: `oldVoiceState | ${oldVoiceState.member.user.tag}` },
            `\n${oldVoiceState}`
          );
        }
        //create timeout if someone left
        this.client.logger.log(
          { color: "info", name: `Music Player: User Left VC` },
          `\nServer: ${oldVoiceState.guild.name}\nUser: ${oldVoiceState.member.user.tag}\nSetting up timeout 30s...`
        );
        player.leaveVCTimeoutId = setTimeout(() => {
          player.leaveVCIfEmpty(newVoiceState.guild.id);
        }, DEFAULT_LEAVE_VC_IF_EMPTY_DELAY);
      } else {
        //clear timeout if someone joined
        if (player.leaveVCTimeoutId) {
          this.client.logger.log(
            { color: "info", name: `Music Player: User Joined VC` },
            `\nServer: ${oldVoiceState.guild.name}\nUser: ${oldVoiceState.member.user.tag}\nClearing timeout...`
          );
          clearTimeout(player.leaveVCTimeoutId);
          player.leaveVCTimeoutId = null;
        }
      }
    } else {
      //=======================================================
      //Deal with bot getting moved to another channel & kicked
      //=======================================================
      if (oldVoiceState.member.id !== this.client.user.id) {
        return;
      }
      //bot just joined the voice chat
      if (!oldVoiceState.channel) {
        return;
      }
      //new voice state might not have a channel if bot was disconnected by someone
      if (!newVoiceState.channel) {
        this.client.logger.log(
          { color: "info", name: `Music Player: Kicked from VC` },
          `\nServer: ${oldVoiceState?.guild.name}\nVC: ${oldVoiceState?.channel.name}`
        );
        this.client.player.deleteQueue(oldVoiceState.guild.id);
        return;
      }
      const oldChannelId = oldVoiceState.channel.id;
      const newChannelId = newVoiceState.channel.id;

      if (oldChannelId !== newChannelId) {
        //update info about current channel
        guildQueue.voiceChannel = newVoiceState.channel;
        //edge case: bot can be moved during "timeout" period
        if (player.leaveVCTimeoutId && guildQueue.voiceChannel.members.size === 1) {
          this.client.logger.log(
            { color: "info", name: `Music Player: Moved During Timeout` },
            `\nServer: ${oldVoiceState.guild.name}\nClearing old one & Setting up a new one...`
          );
          clearTimeout(player.leaveVCTimeoutId);
          player.leaveVCTimeoutId = setTimeout(() => {
            player.leaveVCIfEmpty(newVoiceState.guild.id);
          }, DEFAULT_LEAVE_VC_IF_EMPTY_DELAY);
        } else {
          this.client.logger.log(
            { color: "info", name: `Music Player: Moved` },
            `\nServer: ${oldVoiceState?.guild.name}\nVC: ${oldVoiceState?.channel.name} 🢂 ${newVoiceState?.channel.name}`
          );
          if (player.leaveVCTimeoutId) {
            clearTimeout(player.leaveVCTimeoutId);
          }
          this.client.logger.log(
            { color: "info", name: `Music Player: Moved to Empty Channel` },
            `\nServer: ${oldVoiceState?.guild.name}\nSetting up 30s timer`
          );
          player.leaveVCTimeoutId = setTimeout(() => {
            player.leaveVCIfEmpty(newVoiceState.guild.id);
          }, DEFAULT_LEAVE_VC_IF_EMPTY_DELAY);
        }
        outputEmbed(
          guildQueue.textChannel,
          `Snacky was moved to **${newVoiceState?.channel.name}**. Updating voice-channel informations...`,
          {
            color: this.client.config.colors.info,
          }
        );
      }
    }
  }
}

module.exports = VoiceStateUpdate;
