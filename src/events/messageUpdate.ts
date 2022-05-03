import { Message, MessageEmbed } from "discord.js"
import allowed from '../allowedURIs.js';
import allowedChannels from '../allowedURIChannels.json' assert {type: 'json'};
import {SettClient} from '../types';

const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z\d+&@#\/%?=~_|!:,.;]*[-A-Z\d+&@#\/%=~_|])/ig

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default async(_client: SettClient, _oldMessage: Message, newMessage: Message) =>{
    if(urlRegex.test(escapeRegex(newMessage.content))){
        urlRegex.lastIndex = 0
        //Buradaki eğer durumu mesajı gönderen üyenin belirli bir izni varmı diye bakıyor. Varsa kod çalışmıyor
        if(newMessage.member!.permissions.has("MANAGE_MESSAGES")){
            return
        } 
         
        //NOT: Buradaki listeyi istediğiniz kadar uzatabilirsiniz
        //Kanal listesinde gönderilen kanalın ID'si var mı diye bakıyor.
        if(allowedChannels.includes(newMessage.channel.id)) {
            return;
        }
        //Bütün linklerin üzerinden geçen bir 'for' döngüsü
        
        for(const urls of urlRegex.exec(escapeRegex(newMessage.content))!.input.split(/ {2}| /ig)){
            //Bunu sıfırlamazsak bot bozulur
            urlRegex.lastIndex = 0
            //İzin verilen bir link varsa döngüye bir şey yapmadan devam et.
            if (allowed.includes(urls)) {
                continue
            }
            //İzin verilen link yoksa mesajı sil ve uyarı mesajı at.
            const embed = new MessageEmbed()
                .setAuthor({name: newMessage.author.tag, iconURL: newMessage.author.displayAvatarURL({dynamic: true})})
                .setDescription("Bu kanalda link paylaşmak yasaktır. Lütfen şu kanallarda link paylaşınız:")
                .addField("Link İzni Verilen Kanallar", allowedChannels.length > 0 ? allowedChannels.map(m => `<#${m}>`).join(', ') : "Hiç.")
                .setColor("DARK_RED")
            newMessage.channel.send({embeds: [embed]})
            newMessage.delete()
        }
    }
}