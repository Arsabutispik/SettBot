import { Guild, TextChannel, User } from 'discord.js';
import {MOD_LOG} from '../config.json';
import caseSchema from '../schemas/caseSchema.js';

export default async(guild: Guild, user: User, action: "UYARI" | "BAN" | "AT" | "SUSTUR" | "ZORUNLU_BAN", actionmaker: User, reason: string) => {
    const schema = await caseSchema.findOne({_id: guild.id})
    const caseNumber = schema[0].case ? schema[0].case: 1
    
    const message = `<t:${Math.floor(Date.now() / 1000)}> \`[${caseNumber}]\``

    if(action == "UYARI") {
        message + ` ⚠️ **${user.tag}** (\`${user.id}\`), **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından uyarıldı. Sebep:\n\`\`\`${reason}\`\`\``
    } else if (action == "BAN"){
        message + ` <:banned:958748941661384714>  **${user.tag}** (\`${user.id}\`), **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından banlandı. Sebep:\n\`\`\`${reason}\`\`\``
    } else if(action == "AT") {
        message + ` 👢  **${user.tag}** (\`${user.id}\`), **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından atıldı. Sebep:\n\`\`\`${reason}\`\`\``
    } else if(action == "ZORUNLU_BAN"){
        message + ` <:banbanned:958750684554092594>  Kullanıcı (\`${user.id}\`), **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından zorla banlandı. Sebep:\n\`\`\`${reason}\`\`\``
    }
    const channel = await guild.channels.fetch(MOD_LOG)
    if(channel instanceof TextChannel){
        channel.send(message)
    }
    await caseSchema.findOneAndUpdate({_id: guild.id}, {$inc: {case: 1}}, {upsert: true})
}