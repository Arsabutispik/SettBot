import { MessageEmbed } from "discord.js";
import { commandBase } from "../../types";
import { msToTime, randomRange } from '../../utils/utils.js'

export default {
    name: "günlük",
    category: "Ekonomi",
    description: "Günlük 200 ila 800 arasında <:Gold:955006535472410654> verir",
    async execute({client, message}) {
        let userInfo = await client.DBUser.findOne({_id: message.author.id})
        if(!userInfo) {
            userInfo = await client.DBUser.findOneAndUpdate({_id: message.author.id}, {}, {setDefaultsOnInsert: true, upsert: true, new: true})
        }
        if(userInfo!.daily > new Date()){
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setDescription(`Bir sonra ki saatlik paranı \`${msToTime(userInfo!.daily.getTime() - new Date().getTime())}\` sonra alabilirsin`)
            .setColor("RED")
            .setTimestamp(new Date(userInfo!.daily.getTime()))
            message.channel.send({embeds: [embed]})
            return
        }
        const amount = randomRange(200, 800)
        const embed = new MessageEmbed()
        .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
        .setDescription(`\`${amount}\`<:Gold:955006535472410654> altın bakiyene eklendi! İyi düellolar`)
        .setColor("DARK_GREEN")
        message.channel.send({embeds: [embed]})
        await client.DBUser.findOneAndUpdate({_id: message.author.id}, {$set: {daily: new Date().setHours(new Date().getHours() + 24)}, $inc: {balance: amount}})
    }
} as commandBase