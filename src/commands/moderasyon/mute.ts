import { Message, MessageEmbed } from "discord.js";
import ms from "ms";
import { commandBase } from "../../types";

export default {
    name: "mute",
    description: "Bir kullanıcıyı belirli bir süre susturur",
    usage: "s!mute <kullanıcı> <süre> <sebep>",
    examples: "s!mute <@950752419233542195> 3h aklını topla gel",
    async execute({message, args}) {
        const targetMember = message.mentions.members?.first() || message.guild!.members.cache.get(args[0])
        if(!targetMember){
            const embed = new MessageEmbed()
                .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
                .setColor("RED")
                .setDescription("Bir kullanıcı bulunamadı!")
                message.channel.send({embeds: [embed]})
                return
        }
        if(targetMember.id == message.author.id){
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RED")
            .setDescription("Kendini susturamazsın!")
            message.channel.send({embeds: [embed]})
            return
        }
        if(targetMember.user.bot){
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RED")
            .setDescription("Bir botu susturamazsın!")
            message.channel.send({embeds: [embed]})
            return
        }
        if(targetMember.roles.highest >= message.member!.roles.highest){
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RED")
            .setDescription("Bu kullanıcının rolü senden yüksek (veya aynı) bu kişiyi susturamazsın!")
            message.channel.send({embeds: [embed]})
            return
        }
        if(targetMember.roles.highest >= message.guild!.me!.roles.highest){
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RED")
            .setDescription("Bu kullanıcının rolü benden yüksek (veya aynı) o yüzden bu kişiyi susturamam!")
            message.channel.send({embeds: [embed]})
            return
        }
        if(targetMember.permissions.has("MANAGE_ROLES")){
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RED")
            .setDescription("Bu kullanıcının yetkileri var!")
            message.channel.send({embeds: [embed]})
            return
        }
        const duration = ms(args[1])
        if(!duration) {
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RED")
            .setDescription("Bir süre girmen gerekiyor!")
            message.channel.send({embeds: [embed]})
            return
        }
        let reason = args.slice(2).join(" ")
        if(!reason){
            const msg = await message.reply("Bir sebep belirtmedin lütfen bir sebep belirt")
            const filter = (m: Message) => m.author.id === message.author.id
            try{
                const msg = await message.channel.awaitMessages({filter, max: 1, time: 1000 * 60 * 5, errors: ['time']})
                reason = msg.first()!.content
            } catch {
                msg.delete()
                message.channel.send("Bir sebep verilmedi ban komutu geçersiz kılındı").then(m => {
                    setTimeout(() => {
                        m.delete()
                    }, 1000 * 20)
                })
                return
            }
        }
        const longduration = ms(duration, {long: true}).replaceAll(/seconds|second/, "saniye").replaceAll(/minutes|minute/, "dakika").replaceAll(/hours|hour/, "saat").replaceAll(/day|days/, "gün")
        const embed = new MessageEmbed()
        .setColor("DARK_GREEN")
        .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
        .setDescription(`**${targetMember.user.tag}**, ${longduration} boyunca susturuldu`)
        .setTimestamp(new Date(new Date().getTime() + duration))
        message.channel.send({embeds: [embed]})
    }
} as commandBase