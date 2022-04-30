//Gerekli şeyleri aktar
import Discord, { MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed, TextChannel } from "discord.js";
import { log } from "../utils/utils.js";
import { SettClient } from "../types";
import allowed from '../allowedURIs.js';
import allowedChannels from '../allowedURIChannels.json' assert {type: 'json'};
import config from '../config.json' assert {type: 'json'}
import createMail from "../utils/createMail.js";
//Bir kaç regex
const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default async (client: SettClient, message: Discord.Message) => {
    try {
        //Eğer mesajın sahibi bir bot ise, veya webhook ise hiç bir şey yapma.
        if (message.author.bot || message.webhookId) { 
            return;
        }
        if(message.channel.type === "DM" ){
            if(client.modMail.has(message.author.id)) return
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setDescription("NeonPrice sunucusu için bir bilet açmak üzeresiniz, sorununuzu doğru bir şekilde açıkladığınıza emin misiniz? (Amaçsız açılan biletler kural ihlali olur.)")
            .setColor("DARK_BLUE")
            const accept = new MessageButton()
            .setCustomId("kabul")
            .setDisabled(false)
            .setStyle("SUCCESS")
            .setEmoji("✅")
            const reject = new MessageButton()
            .setCustomId("reddet")
            .setDisabled(false)
            .setStyle("DANGER")
            .setEmoji("❌")

            const actionRow = new MessageActionRow()
            .addComponents(accept, reject)
            const msg = await message.channel.send({embeds: [embed], components: [actionRow]})
            let reply: MessageComponentInteraction;
            try {
                const filter = (interaction: MessageComponentInteraction) => interaction.customId == "kabul" || interaction.customId == "reddet"
                reply = await msg.awaitMessageComponent({filter, componentType: "BUTTON", time: 300000})
            } catch {
                const errorEmbed = new MessageEmbed()
                .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
                .setDescription("Zamanında bir yanıt gelmedi bilet kapandı")
                .setColor("DARK_RED")
                message.channel.send({embeds: [errorEmbed]})
                accept.setDisabled(true)
                reject.setDisabled(true)
                const newRow = new MessageActionRow()
                .addComponents(accept, reject)
                msg.edit({components: [newRow]})
                return
            }
            if(reply.customId == "kabul") {
                const embed = new MessageEmbed()
                .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
                .setDescription("Bilet açmayı kabul ettiniz biletinize bir veya bir kaç moderatör yakında dönecektir")
                .setColor("GREEN")
                message.channel.send({embeds: [embed]})
                accept.setDisabled(true)
                reject.setDisabled(true)
                const newRow = new MessageActionRow()
                .addComponents(accept, reject)
                msg.edit({components: [newRow]})
                const guild = client.guilds.cache.get("Sunucu ID")
                const channel = await guild!.channels.create(`${message.author.username}-${message.author.discriminator}`, {parent: "954479782987432016", permissionOverwrites: [
                    {
                        id: "özel rol",
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                    },
                    {
                        id: guild!.roles.everyone,
                        deny: "VIEW_CHANNEL"
                    }
                ]}) as TextChannel
                const modMailLog = guild!.channels.cache.get(config.MOD_MAIL)
                const mailEmbed = new MessageEmbed()
                .setTitle("Yeni Bilet")
                .setFooter({text: `${message.author.tag} | ${message.author.id}`, iconURL: message.author.displayAvatarURL({dynamic: true})})
                .setColor("AQUA")
                if(modMailLog instanceof TextChannel){
                    modMailLog.send({embeds: [mailEmbed]})
                }
                const infoEmbed = new MessageEmbed()
                .setTitle(`${message.author.tag} Bir Bilet Açtı`)
                .setDescription(`${config.PREFIX} ile başlayan mesajları bot görmezden gelecektir bu özellik moderatörlerin arasında konuşabilmesi için vardır. ${config.PREFIX}kapat [sebep] ile bileti kapatabilirsiniz.`)
                .setColor("DARK_GOLD")
                .setFooter({text: `${message.author.tag} | ${message.author.id}`, iconURL: message.author.displayAvatarURL({dynamic: true})})
                const firstEmbed = new MessageEmbed()
                .setFooter({text: `${message.author.tag} | ${message.author.id}`, iconURL: message.author.displayAvatarURL({dynamic: true})})
                .setTitle("Yeni Mesaj")
                .setDescription(message.content)
                .setTimestamp()
                .setColor("GREEN")
                channel.send({embeds: [infoEmbed, firstEmbed]})
                createMail(client, message.author, channel)
                client.modMail.set(message.author.id, true)
            } else if(reply.customId == "reddet"){
                const errorEmbed = new MessageEmbed()
                .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
                .setDescription("Bilet açmayı reddettiniz")
                .setColor("DARK_RED")
                message.channel.send({embeds: [errorEmbed]})
                accept.setDisabled(true)
                reject.setDisabled(true)
                const newRow = new MessageActionRow()
                .addComponents(accept, reject)
                msg.edit({components: [newRow]})
            }
            return
        }
        if(urlRegex.test(escapeRegex(message.content))){
            urlRegex.lastIndex = 0
            //Buradaki eğer durumu mesajı gönderen üyenin belirli bir izni varmı diye bakıyor. Varsa kod çalışmıyor
            if(message.member!.permissions.has("MANAGE_MESSAGES")){
                return
            } 
             
            //NOT: Buradaki listeyi istediğiniz kadar uzatabilirsiniz
            //Kanal listesinde gönderilen kanalın ID'si var mı diye bakıyor.
            if(allowedChannels.includes(message.channel.id)) {
                return;
            }
            //Bütün linklerin üzerinden geçen bir 'for' döngüsü
            
            for(const urls of urlRegex.exec(escapeRegex(message.content))!.input.split(/  | /ig)){
                //Bunu sıfırlamazsak bot bozulur
                urlRegex.lastIndex = 0
                //İzin verilen bir link varsa döngüye bir şey yapmadan devam et.
                if(allowed.includes(urls)){
                    continue
                } else {
                    //İzin verilen link yoksa mesajı sil ve uyarı mesajı at.
                    const embed = new MessageEmbed()
                    .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
                    .setDescription("Bu kanalda link paylaşmak yasaktır. Lütfen şu kanallarda link paylaşınız:")
                    .addField("Link İzni Verilen Kanallar", allowedChannels.length > 0 ? allowedChannels.map(m => `<#${m}>`).join(', '): "Hiç.")
                    .setColor("DARK_RED")
                    message.channel.send({embeds: [embed]})
                    message.delete()
                }
            }
        }
        //Bir regex ve prefix kontrolü
        const prefixRegex = new RegExp(`^(<@!?${client.user!.id}>|${escapeRegex(config.PREFIX)})\\s*`);
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