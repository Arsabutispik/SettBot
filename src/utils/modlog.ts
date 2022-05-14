import { Guild, TextChannel, User } from 'discord.js';
import config from '../config.json' assert {type: "json"};
import caseSchema from '../schemas/caseSchema.js';
import ms from 'ms';
type actions = "UYARI" | "BAN" | "AT" | "SUSTUR" | "ZORUNLU_BAN" | "SÜRELİ_BAN" | "DEĞİŞİKLİK" | "BAN_KALDIR" | "BAN_SÜRESİ"

export default async(guild: Guild, user: User, action: actions, actionmaker: User, reason: string, duration?: number, casenumber?: number) => {
    let schema = await caseSchema.findOne({_id: guild.id})
    if(!schema){
        schema = await caseSchema.findOneAndUpdate({_id: guild.id}, {case: 1}, {upsert: true, new: true})
    }
    const caseNumber = schema.case
    
    let message = `<t:${Math.floor(Date.now() / 1000)}> \`[${caseNumber}]\``

    if(action === "UYARI") {
        message += ` ⚠️ **${user.tag}** (\`${user.id}\`), **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından uyarıldı. Sebep:\n\`\`\`${reason}\`\`\``
    } else if (action === "BAN"){
        message += ` <:banned:958748941661384714>  **${user.tag}** (\`${user.id}\`), **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından yasaklandı. Sebep:\n\`\`\`${reason}\`\`\``
    } else if(action === "AT") {
        message += ` 👢  **${user.tag}** (\`${user.id}\`), **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından atıldı. Sebep:\n\`\`\`${reason}\`\`\``
    } else if(action === "ZORUNLU_BAN"){
        message += ` <:banbanned:958750684554092594> Kullanıcı (\`${user.id}\`), **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından zorla banlandı. Sebep:\n\`\`\`${reason}\`\`\``
    } else if(action === "SUSTUR"){
        const amount = ms(duration!, {long: true}).replace(/seconds|second/, "saniye").replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün")
        message += `🔇 **${user.tag}** (\`${user.id}\`), **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından **${amount}** boyunca susturuldu. Sebep:\n\`\`\`${reason}\`\`\``
    } else if (action === "DEĞİŞİKLİK"){
        message += `✏️ Olay ${casenumber} **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından değiştirildi. Sebep:\n\`\`\`${reason}\`\`\``
    } else if(action === "SÜRELİ_BAN") {
        const amount = ms(duration!, {long: true}).replace(/seconds|second/, "saniye").replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün")
        message += `<:banned:958748941661384714> **${user.tag}** (\`${user.id}\`), **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından **${amount}** boyunca yasaklandı. Sebep:\n\`\`\`${reason}\`\`\``
    } else if(action === "BAN_KALDIR"){
        message += `🔓 Kullanıcı (\`${user.id}\`), **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından yasağı kaldırıldı. Sebep:\n\`\`\`${reason}\`\`\``
    } else if(action === "BAN_SÜRESİ"){
        const amount = ms(duration!, {long: true}).replace(/seconds|second/, "saniye").replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün")
        message += `🔓 Kullanıcı (\`${user.id}\`), **${amount}** sonra **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından otomatik olarak yasağı kaldırıldı. Sebep:\n\`\`\`${reason}\`\`\``
    }

    const channel = await guild.channels.fetch(config.MOD_LOG)
    if(channel instanceof TextChannel){
        channel.send(message)
    }
    await caseSchema.findOneAndUpdate({_id: guild.id}, {$inc: {case: 1}}, {upsert: true})
}