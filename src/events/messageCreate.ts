//Gerekli şeyleri aktar
import Discord, { MessageEmbed } from "discord.js";
import { log } from "../utils/utils.js";
import { SettClient } from "../types";
import allowed from '../allowedURIs.js';
import allowedChannels from '../allowedURIChannels.json';

//Bir kaç regex
const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default async (client: SettClient, message: Discord.Message) => {
    try {
        //Eğer mesajın sahibi bir bot ise, veya webhook ise hiç bir şey yapma.
        if (message.author.bot || message.channel.type === "DM" || message.webhookId) { 
            return;
        }
        if(urlRegex.test(escapeRegex(message.content))){
            //Buradaki eğer durumu mesajı gönderen üyenin belirli bir izni varmı diye bakıyor. Varsa kod çalışmıyor
            if(message.member!.permissions.has("ADMINISTRATOR")){
                return
            } //NOT: Buradaki listeyi istediğiniz kadar uzatabilirsiniz
            //Kanal listesinde gönderilen kanalın ID'si var mı diye bakıyor.
            if(allowedChannels.includes(message.channel.id)) {
                return;
            }
            //Bütün linklerin üzerinden geçen bir 'for' döngüsü
            for(const urls of urlRegex.exec(escapeRegex(message.content))!.input.split(/  | /ig)){
                //İzin verilen bir link varsa döngüye bir şey yapmadan devam et.
                if(allowed.includes(urls)){
                    continue
                } else {
                    //İzin verilen link yoksa mesajı sil ve uyarı mesajı at.
                    message.delete()
                    const embed = new MessageEmbed()
                    .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL()})
                    .setDescription("Bu kanalda link paylaşmak yasaktır. Lütfen şu kanallarda link paylaşınız:")
                    .addField("Link İzni Verilen Kanallar", allowedChannels.length > 0 ? allowedChannels.map(m => {`<#${m}>`}).join(', '): "Hiç.")
                    .setColor("DARK_RED")
                    message.channel.send({embeds: [embed]})
                }
            }
        }
        //Bir regex ve prefix kontrolü
        const prefixRegex = new RegExp(`^(<@!?${client.user!.id}>|${escapeRegex("s!")})\\s*`);
        if (!prefixRegex.test(message.content)) return;
        //Komut kontrolleri
        //@ts-ignore
        const [, matchedPrefix] = message.content.match(prefixRegex);
        let msgargs = message.content.slice(matchedPrefix.length).trim().split(/ +/);
        let cmdName = msgargs.shift()!.toLowerCase();

        if (message.mentions.has(client.user!) && !cmdName){
            message.channel.send(`Prefix'im \`s!\` veya ${client.user}\nBütün komutlarımı görmek için \`s!yardım\` veya \`${client.user!.tag} yardım\` kullanabilirsiniz.`);
            return;
        }
        const command = client.commands.get(cmdName) 

        if (!command) return;
        
        command.execute({ client: client, message: message, args: msgargs});
    } catch (e) {
        log("ERROR", "src/eventHandlers/message.js", e.message);
    }
};