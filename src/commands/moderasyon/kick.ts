import { MessageEmbed } from "discord.js";
import { commandBase } from "../../types";
import caseSchema from "../../schemas/caseSchema.js";
import modlog from "../../utils/modlog.js";

export default {
    name: "kick",
    category: "Moderasyon",
    async execute({message, args}) {
        const clean = args[0]
        if(clean == "-temizle"){
            const user = message.mentions.members?.first() || message.guild!.members.cache.get(args[1])
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
                .setDescription("Kendini atamazsın!")
                message.channel.send({embeds: [embed]})
                return
            }
            if(user.user.bot){
                const embed = new MessageEmbed()
                .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
                .setColor("RED")
                .setDescription("Bir botu atamazsın!")
                message.channel.send({embeds: [embed]})
                return
            }
            if(user.roles.highest >= message.member!.roles.highest){
                const embed = new MessageEmbed()
                .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
                .setColor("RED")
                .setDescription("Bu kullanıcının rolü senden yüksek (veya aynı) bu kişiyi atamazsın!")
                message.channel.send({embeds: [embed]})
                return
            }
            if(user.roles.highest >= message.guild!.me!.roles.highest){
                const embed = new MessageEmbed()
                .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
                .setColor("RED")
                .setDescription("Bu kullanıcının rolü benden yüksek (veya aynı) o yüzden bu kişiyi atamam!")
                message.channel.send({embeds: [embed]})
                return
            }
            if(user.permissions.has("KICK_MEMBERS")){
                const embed = new MessageEmbed()
                .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
                .setColor("RED")
                .setDescription("Bu kullanıcının yetkileri var!")
                message.channel.send({embeds: [embed]})
                return
            }
            const cases = await caseSchema.findOne({_id: message.guild!.id})
            try {
                await user.send(`NeonPrice sunucusundan atıldınız. Sebep: ${args.slice(2)}`)
                message.channel.send(`<:checkmark:962444136366112788> **${user.user.tag}** atıldı (Olay #${cases.cases + 1}) Kullanıcı özel bir mesaj ile bildirildi`)
            } catch {
                message.channel.send(`<:checkmark:962444136366112788> **${user.user.tag}** yasaklandı (Olay #${cases.cases + 1}) Kullanıcıya özel mesaj atılamadı`)
            }
            modlog(message.guild!, user.user, "AT", message.author, args.slice(2).join(" "))
            await user.ban({days: 7, reason: "sotban"})
            await message.guild?.members.unban(user.id, "softban")
        } else if(clean !== "-temizle" && message.mentions.members?.first()?.toString() !== clean){
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RED")
            .setDescription("Bir kullanıcı ver veya -temizle özelliğini kullan")
            message.channel.send({embeds: [embed]})
            return
        }
    }
} as commandBase