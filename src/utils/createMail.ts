import { Message, MessageEmbed, TextChannel, User } from "discord.js";
import { chunkSubstr } from "./utils.js";
import config from '../config.json' assert {type: 'json'}
import { SettClient } from "src/types.js";

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default async(client: SettClient, member: User, channel: TextChannel) => {
    const filter = (m: Message) => m.author.id == member.id
    const memberDM = await member.createDM()
    const collector = memberDM.createMessageCollector({filter})
    collector.on('collect', message => {
        if(message.content.length > 2000){
           const chunks = chunkSubstr(message.content, 2000)
           for(const chunk of chunks){
            const embed = new MessageEmbed()
            .setFooter({text: `${member.tag} | ${member.id}`, iconURL: member.displayAvatarURL({dynamic: true})})
            .setTitle("Uzun Mesaj")
            .setDescription(chunk)
            .setTimestamp()
            .setColor("GREEN")
            channel.send({embeds: [embed]})
           }
        }
        const embed = new MessageEmbed()
        .setFooter({text: `${member.tag} | ${member.id}`, iconURL: member.displayAvatarURL({dynamic: true})})
        .setTitle("Yeni Mesaj")
        .setDescription(message.content)
        .setTimestamp()
        .setColor("GREEN")
        channel.send({embeds: [embed]})
        for(const attachment of message.attachments) {
            channel.send(attachment[1].url)
        }
    })
    const filter2 = (m: Message) => !m.author.bot
    const collector2 = channel.createMessageCollector({filter: filter2})
    collector2.on("collect", message => {
        const prefixRegex = new RegExp(`^(<@!?${client.user!.id}>|${escapeRegex(config.PREFIX)})\\s*`);
        if (prefixRegex.test(message.content)){
            //@ts-ignore
            const [, matchedPrefix] = message.content.match(prefixRegex);
            let msgargs = message.content.slice(matchedPrefix.length).trim().split(/ +/);
            let cmdName = msgargs.shift()!.toLowerCase()
            if(cmdName == "kapat"){
                const modMail = channel.guild.channels.cache.get(config.MOD_MAIL)
                const ticketClose = new MessageEmbed()
                .setFooter({text: `${member.tag} | ${member.id}`, iconURL: member.displayAvatarURL({dynamic: true})})
                .setTitle("Bilet Kapandı")
                .setDescription(msgargs.join(" "))
                .setColor("RED")
                const memberTicketClose = new MessageEmbed()
                .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
                .setFooter({text: `${message.guild!.name} | ${message.guild!.id}`, iconURL: message.guild!.iconURL({dynamic: true}) || "https://logodownload.org/wp-content/uploads/2017/11/discord-logo-4-1.png"})
                .setTitle("Bilet Kapandı")
                .setDescription(msgargs.join(" "))
                .setColor("RED")
                if(modMail instanceof TextChannel){
                    modMail.send({embeds: [ticketClose]})
                }
                memberDM.send({embeds: [memberTicketClose]})
                memberDM.delete()
                channel.delete()
                client.modMail.delete(member.id)
            }
            return
        }
        if(message.content.length > 2000){
            const chunks = chunkSubstr(message.content, 2000)
            for(const chunk of chunks){
                const embed = new MessageEmbed()
                .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
                .setFooter({text: `${message.guild!.name} | ${message.guild!.id}`, iconURL: message.guild!.iconURL({dynamic: true}) || "https://logodownload.org/wp-content/uploads/2017/11/discord-logo-4-1.png"})
                .setTitle("Uzun Mesaj")
                .setDescription(chunk)
                .setTimestamp()
                .setColor("GREEN")
                member.send({embeds: [embed]})
           }
        }
        const embed = new MessageEmbed()
        .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
        .setFooter({text: `${message.guild!.name} | ${message.guild!.id}`, iconURL: message.guild!.iconURL({dynamic: true}) || "https://logodownload.org/wp-content/uploads/2017/11/discord-logo-4-1.png"})
        .setTitle("Yeni Mesaj")
        .setDescription(message.content)
        .setColor("GREEN")
        .setTimestamp()
        member.send({embeds: [embed]})
        for(const attachment of message.attachments) {
            member.send(attachment[1].url)
        }
        const sucessEmbed = new MessageEmbed()
        .setTitle("Mesaj Gönderildi")
        .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
        .setFooter({text: member.tag, iconURL: member.displayAvatarURL({dynamic: true})})
        .setDescription(message.content)
        .setColor("GREEN")
        message.channel.send({embeds: [sucessEmbed]})
        message.delete()
    })
}