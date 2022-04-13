import { Message, MessageEmbed } from "discord.js";
import ms from "ms";
import { commandBase } from "../../types";
import modlog from "../../utils/modlog";
import caseSchema from "../../schemas/caseSchema.js";
import punishment from "../../schemas/punishmentSchema.js";

export default {
    name: "ban",
    category: "Moderasyon",
    description: "Bir kullanıcıyı sınırsız veya belirli bir süreliğine yasaklar",
    usage: "s!ban <kullanıcı> [süre] <sebep>",
    examples: "s!ban <@950752419233542195> 1h sınavın bitince gel (1 saatlik bir ban atar)\ns!ban <@950752419233542195> 3d troll (3 günlük ban atar)\ns!ban <@950752419233542195> raid (süresiz ban)",
    async execute({message, args}) {
        const user = message.mentions.members?.first() || message.guild!.members.cache.get(args[0])
        if(!user){
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RED")
            .setDescription("Bir kullanıcı bulunamadı!")
            message.channel.send({embeds: [embed]})
            return
        }
        if(user.id == message.author.id){
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RED")
            .setDescription("Kendini banlayamazsın!")
            message.channel.send({embeds: [embed]})
            return
        }
        if(user.user.bot){
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RED")
            .setDescription("Bir botu banlayamazsın!")
            message.channel.send({embeds: [embed]})
            return
        }
        if(user.roles.highest >= message.member!.roles.highest){
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RED")
            .setDescription("Bu kullanıcının rolü senden yüksek (veya aynı) bu kişiyi banlayamazsın!")
            message.channel.send({embeds: [embed]})
            return
        }
        if(user.roles.highest >= message.guild!.me!.roles.highest){
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RED")
            .setDescription("Bu kullanıcının rolü benden yüksek (veya aynı) o yüzden bu kişiyi banlayamam!")
            message.channel.send({embeds: [embed]})
            return
        }
        if(user.permissions.has("BAN_MEMBERS")){
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RED")
            .setDescription("Bu kullanıcının yetkileri var!")
            message.channel.send({embeds: [embed]})
            return
        }
        const duration = ms(args[1])
        const cases = await caseSchema.findOne({_id: message.guild!.id})
        if(duration){
            const longduration = ms(duration, {long: true}).replaceAll(/seconds|second/, "saniye").replaceAll(/minutes|minute/, "dakika").replaceAll(/hours|hour/, "saat").replaceAll(/day|days/, "gün")
            let reason = args.slice(2).join(" ")
            if(!reason){
               const msg = await message.reply("Bir sebep belirtmedin lütfen bir sebep belirt")
                const filter = (m: Message) => m.author.id === message.author.id
                try{
                    const msg = await message.channel.awaitMessages({filter, max: 1, idle: 1000 * 60 * 5})
                    reason = msg.first()!.content
                } catch {
                    msg.delete()
                    message.channel.send("Bir sebep verilmedi ban komutu geçersiz kılındı").then(m => {
                        setTimeout(() => {
                            m.delete()
                        }, 1000 * 20)
                    })
                }
            }
            try{
                await user.send(`Neon price sunucusundan **${longduration}** boyunca banlandın. Sebep: ${args.slice(1).join(" ")}`)
                message.channel.send(`<:checkmark:962444136366112788> **${user.user.tag}** yasaklandı (Olay #${cases.cases + 1}) Kullanıcı özel bir mesaj ile bildirildi`)
            } catch {
                message.channel.send(`<:checkmark:962444136366112788> **${user.user.tag}** yasaklandı (Olay #${cases.cases + 1}) Kullanıcıya özel mesaj atılamadı`)
            }
            user.ban({reason, days: 7})
            await new punishment({userId: user.id, staffId: message.author.id, reason, expires: new Date(Date.now() + duration), type: "ban"}).save()
            modlog(message.guild!, user.user, "SÜRELİ_BAN", message.author, reason, duration)
        } else {
            let reason = args.slice(1).join(" ")
            if(!reason){
                const msg = await message.reply("Bir sebep belirtmedin lütfen bir sebep belirt")
                 const filter = (m: Message) => m.author.id === message.author.id
                 try{
                     const msg = await message.channel.awaitMessages({filter, max: 1, idle: 1000 * 60 * 5})
                     reason = msg.first()!.content
                 } catch {
                     msg.delete()
                     message.channel.send("Bir sebep verilmedi ban komutu geçersiz kılındı").then(m => {
                         setTimeout(() => {
                             m.delete()
                         }, 1000 * 20)
                     })
                 }
             }
            try{
                await user.send(`Neon price sunucusundan süresiz banlandın. Sebep: ${reason}`)
                message.channel.send(`<:checkmark:962444136366112788> **${user.user.tag}** yasaklandı (Olay #${cases.cases + 1}) Kullanıcı özel bir mesaj ile bildirildi`)
            } catch {
                message.channel.send(`<:checkmark:962444136366112788> **${user.user.tag}** yasaklandı (Olay #${cases.cases + 1}) Kullanıcıya özel mesaj atılamadı`)
            }
            user.ban({reason, days: 7})
            modlog(message.guild!, user.user, "BAN", message.author, reason)
        }
    }
} as commandBase