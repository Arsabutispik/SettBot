import { commandBase } from '../../types'
import config from '../../config.json'
import punishment from "../../schemas/punishmentSchema.js";
import {Message, MessageEmbed} from "discord.js";
import caseSchema from "../../schemas/caseSchema";
import modlog from "../../utils/modlog";
import ms from "ms";

export default {
    name: "uyar",
    description: "Bir kullanıcıyı uyarır.",
    usage: `${config.PREFIX}uyar <kullanıcı> <sebep>`,
    examples: `${config.PREFIX}uyar <@950752419233542195> spam`,
    async execute({message, args}) {
        const member = message.mentions.members?.first() || message.guild!.members.cache.get(args[0])
        if(!member){
            const embed = new MessageEmbed()
                .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
                .setColor("RED")
                .setDescription("Bir kullanıcı bulunamadı!")
            message.channel.send({embeds: [embed]})
            return
        }
        if(member.id == message.author.id){
            const embed = new MessageEmbed()
                .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
                .setColor("RED")
                .setDescription("Kendini uyaramazsın!")
            message.channel.send({embeds: [embed]})
            return
        }
        if(member.user.bot){
            const embed = new MessageEmbed()
                .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
                .setColor("RED")
                .setDescription("Bir botu atamazsın!")
            message.channel.send({embeds: [embed]})
            return
        }
        if(member.roles.highest >= message.member!.roles.highest){
            const embed = new MessageEmbed()
                .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
                .setColor("RED")
                .setDescription("Bu kullanıcının rolü senden yüksek (veya aynı) bu kişiyi atamazsın!")
            message.channel.send({embeds: [embed]})
            return
        }
        if(member.roles.highest >= message.guild!.me!.roles.highest){
            const embed = new MessageEmbed()
                .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
                .setColor("RED")
                .setDescription("Bu kullanıcının rolü benden yüksek (veya aynı) o yüzden bu kişiyi atamam!")
            message.channel.send({embeds: [embed]})
            return
        }
        if(member.permissions.has("MODERATE_MEMBERS")){
            const embed = new MessageEmbed()
                .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
                .setColor("RED")
                .setDescription("Bu kullanıcının yetkileri var!")
            message.channel.send({embeds: [embed]})
            return
        }
        let reason = args.slice(1).join(" ")
        if(!reason){
            const msg = await message.reply("Bir sebep belirtmedin lütfen bir sebep belirt")
            const filter = (m: Message) => m.author.id === message.author.id
            try{
                const msg = await message.channel.awaitMessages({filter, max: 1, time: 1000 * 60 * 5, errors: ['time']})
                reason = msg.first()!.content
            } catch {
                await msg.delete()
                message.channel.send("Bir sebep verilmedi ban komutu geçersiz kılındı").then(m => {
                    setTimeout(() => {
                        m.delete()
                    }, 1000 * 20)
                })
                return
            }
        }
        let cases = await caseSchema.findOne({_id: message.guild!.id})
        if(!cases){
            cases = await caseSchema.findOneAndUpdate({_id: message.guild!.id}, {}, {setDefaultsOnInsert: true})
        }
        let date = new Date()
        date = new Date(date.setDate((date.getDate() + 15)))
        message.channel.send(`<:checkmark:962444136366112788> **${member.user.tag}** uyarıldı (Olay #${cases.case}) Kullanıcı özel bir mesaj ile bildirildi`)
        modlog(message.guild!, member.user, "UYARI", message.author, args.slice(1).join(" "))
        await new punishment({userId: member.id, staffId: message.author.id, reason, expires: date, type: "uyarı"}).save()
        const punishments = await punishment.find({userId: member.id})
        const sizeOf = punishments.filter((val => val.type === "uyarı")).length
        if(sizeOf === 2) {
            const longduration = ms(ms("10m"), {long: true}).replace(/seconds|second/, "saniye").replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün")
            try {
                await member.send(`NeonPrice sunucusunda ${longduration} boyunca susturuldunuz. Sebep: Otomatik Ceza Artışı (2. Uyarı)`)
                message.channel.send(`<:checkmark:962444136366112788> **${member.user.tag}** ${longduration} boyunca susturuldu (Olay #${cases.case}) Kullanıcı özel bir mesaj ile bildirildi`)
            } catch {
                message.channel.send(`<:checkmark:962444136366112788> **${member.user.tag}** ${longduration} boyunca susturuldu (Olay #${cases.case}) Kullanıcıya özel mesaj atılamadı`)
            }
            await new punishment({userId: member.id, staffId: message.author.id, reason: "Otomatik Ceza Artışı (2. Uyarı)", expires: new Date(Date.now() + ms("10m")), type: "mute"}).save()
            modlog(message.guild!, member.user, "SUSTUR", message.author, reason, ms("10m"))
            member.roles.add(config.MUTE_ROLE)
        } else if(sizeOf === 3) {
            const longduration = ms(ms("2h"), {long: true}).replace(/seconds|second/, "saniye").replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün")
            try {
                await member.send(`NeonPrice sunucusunda ${longduration} boyunca susturuldunuz. Sebep: Otomatik Ceza Artışı (3. Uyarı)`)
                message.channel.send(`<:checkmark:962444136366112788> **${member.user.tag}** ${longduration} boyunca susturuldu (Olay #${cases.case}) Kullanıcı özel bir mesaj ile bildirildi`)
            } catch {
                message.channel.send(`<:checkmark:962444136366112788> **${member.user.tag}** ${longduration} boyunca susturuldu (Olay #${cases.case}) Kullanıcıya özel mesaj atılamadı`)
            }
            await new punishment({userId: member.id, staffId: message.author.id, reason: "Otomatik Ceza Artışı (3. Uyarı)", expires: new Date(Date.now() + ms("2h")), type: "mute"}).save()
            modlog(message.guild!, member.user, "SUSTUR", message.author, reason, ms("2h"))
            member.roles.add(config.MUTE_ROLE)
        } else if(sizeOf === 4){
            const longduration = ms(ms("1d"), {long: true}).replace(/seconds|second/, "saniye").replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün")
            try {
                await member.send(`NeonPrice sunucusunda ${longduration} boyunca yasaklandınız. Sebep: Otomatik Ceza Artışı (4. Uyarı)`)
                message.channel.send(`<:checkmark:962444136366112788> **${member.user.tag}** ${longduration} boyunca yasaklandı (Olay #${cases.case}) Kullanıcı özel bir mesaj ile bildirildi`)
            } catch {
                message.channel.send(`<:checkmark:962444136366112788> **${member.user.tag}** ${longduration} boyunca yasaklandı (Olay #${cases.case}) Kullanıcıya özel mesaj atılamadı`)
            }
            await new punishment({userId: member.id, staffId: message.author.id, reason: "Otomatik Ceza Artışı (4. Uyarı)", expires: new Date(Date.now() + ms("1d")), type: "ban"}).save()
            modlog(message.guild!, member.user, "SÜRELİ_BAN", message.author, reason, ms("10m"))
            await member.ban({reason: "Otomatik Ceza Artışı (4. Uyarı)", days: 7})
        } else if(sizeOf === 5) {
            try {
                await member.send(`NeonPrice sunucusundan yasaklandınız. Sebep: Otomatik Ceza Artışı (5. Uyarı)`)
                message.channel.send(`<:checkmark:962444136366112788> **${member.user.tag}** yasaklandı (Olay #${cases.case}) Kullanıcı özel bir mesaj ile bildirildi`)
            } catch {
                message.channel.send(`<:checkmark:962444136366112788> **${member.user.tag}** yasaklandı (Olay #${cases.case}) Kullanıcıya özel mesaj atılamadı`)
            }
            modlog(message.guild!, member.user, "BAN", message.author, reason,)
            await member.ban({reason: "Otomatik Ceza Artışı (5. Uyarı)", days: 7})
        }

    }
} as commandBase;