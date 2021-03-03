import { Message, CommandInterface, BotClient } from "discord.js";
import Command from "../../base/Command";
import { getEmojiById, getRandomInt, outputEmbed } from "../../utils/generic";

class DurajPls extends Command implements CommandInterface {
  quotes: string[];
  previousQuoteIndex: number;
  constructor(client: BotClient) {
    super(client, {
      name: "durajpls",
      description: "Gives you a random quote from the greatest local philosopher",
      usage: "<prefix>durajpls",
      aliases: ["quote"],
      category: "Fun",
    });
    this.quotes = [
      "Urzędy nie mają serca",
      "Problem nie jest problemem",
      "Raz od wielkiego dzwona",
      "Zmontrować się",
      "Stan pogłowia = liczba obecnych osób",
      "Logistycznie dobrze rozegrać swój czas żeby wilk był syty i owca cała",
      "Czasem jak się pan Duraj zwiesi to znaczy że się zamyślił",
      "Uczeń - tryb ninja",
      'Ktoś wchodzi na lekcje  "Kto mi tu wbił na kwadrat"',
      "Dzięki za wsparcie",
      "Wy dziabągi",
      "Ferioświęta albo Świętoferie",
      "Co? Gucio w zoo",
      "Złudne ciepło",
      "Nie bądź burak, przywitaj się!",
      "Kto ma cohones niech sie przyzna",
      "Zajezusiście",
      "Kto mnie tutaj tarabani",
      "Albo będziecie punktualni albo będziecie ocieplać chiński mur",
      "Let's check it out!",
      "Take your shot!",
      "You're great!",
      "Thank you so much!",
      "Would you like to listen to this once again?",
      "Well done!",
      "Alright!",
      "Correct!",
      "Easy peasy lemon squeezy",
      "Szanowni panowie na jakiej stronie pdf skończyliśmy?",
      "You got ... yyy you got exercise 5 on page 36 pdf",
    ];
    this.previousQuoteIndex = null;
  }

  async run(msg: Message) {
    let randomQuoteIndex = getRandomInt(0, this.quotes.length - 1);
    const [messageReference] = await outputEmbed(
      msg.channel,
      `The great Piotr Duraj once said\n\n> **${this.quotes[randomQuoteIndex]}**`,
      {
        color: this.client.config.colors.info,
        footerText: Math.random() > 0.9 ? "And then everyone clapped" : "",
      }
    );
    const pepeNote = getEmojiById(this.client.config.reactionEmojis.pepeNote, this.client);
    messageReference.react(pepeNote);
  }
}

module.exports = DurajPls;
