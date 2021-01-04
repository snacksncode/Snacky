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
    const guildQueue = this.client.player.guildsQueue.get(
      newVoiceState.guild.id
    );
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
        //if there is no timeout set this will contains null thus won't trigger if statement
        if (player.leaveVCTimeoutId) {
          clearTimeout(player.leaveVCTimeoutId);
        }
        //create timeout if someone left
        this.client.logger.log(
          { color: "warning", name: "Music Player: Debug" },
          `${oldVoiceState.member.user.tag} left VC (${oldVoiceState.channel.name}). I'll check it's state after 30s`
        );
        player.leaveVCTimeoutId = setTimeout(() => {
          player.leaveVCIfEmpty(newVoiceState.guild.id);
        }, DEFAULT_LEAVE_VC_IF_EMPTY_DELAY);
      } else {
        //clear timeout if someone joined
        this.client.logger.log(
          { color: "warning", name: "Music Player: Debug" },
          `${newVoiceState.member.user.tag} joined VC (${newVoiceState.channel.name}). Clearing timeout...`
        );
        clearTimeout(player.leaveVCTimeoutId);
      }
    }
    //===================================================
    //Deal with bot getting moved from channel to channel
    //===================================================
    if (oldVoiceState.member.id !== this.client.user.id) {
      return;
    }
    //bot just joined the voice chat
    if (!oldVoiceState.channel) {
      return;
    }
    //new voice state might not have a channel if bot was disconnected by someone
    if (!newVoiceState.channel) {
      return;
    }
    const oldChannelId = oldVoiceState.channel.id;
    const newChannelId = newVoiceState.channel.id;

    if (oldChannelId !== newChannelId) {
      //edge case: bot can be moved during "timeout" period
      if (
        player.leaveVCTimeoutId &&
        guildQueue.voiceChannel.members.size === 1
      ) {
        if (player.leaveVCTimeoutId) {
          clearTimeout(player.leaveVCTimeoutId);
        }
        //if channel object disappeared in newState this means that user has left
        this.client.logger.log(
          { color: "warning", name: "Music Player: Debug" },
          `Snacky was moved to an empty VC (${newVoiceState.channel.name}). I'll check this channel's status after 30s`
        );
        player.leaveVCTimeoutId = setTimeout(() => {
          player.leaveVCIfEmpty(newVoiceState.guild.id);
        }, DEFAULT_LEAVE_VC_IF_EMPTY_DELAY);
      }
      guildQueue.voiceChannel = newVoiceState.channel;
      outputEmbed(
        guildQueue.textChannel,
        `Snacky was moved to **${newVoiceState.channel.name}**. Updating voice-channel informations...`,
        {
          color: this.client.config.colors.info,
        }
      );
    }
  }
}

module.exports = VoiceStateUpdate;
