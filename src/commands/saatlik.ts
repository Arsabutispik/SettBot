import { MessageEmbed } from "discord.js";
import { commandBase } from "../types";
import { msToTime, randomRange } from '../utils/utils.js'

export default {
    name: "saatlik",
    async execute({client, message}) {
        let userInfo = await client.DBUser.findOne({_id: message.author.id})
        if(!userInfo) {
            userInfo = await client.DBUser.findOneAndUpdate({_id: message.author.id}, {}, {setDefaultsOnInsert: true, upsert: true, new: true})
        }
        if(userInfo!.hourly > new Date()){
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setDescription(`Bir sonra ki saatlik paranı \`${msToTime(userInfo!.hourly.getTime() - new Date().getTime())}\` sonra alabilirsin`)
            .setColor("RED")
            .setTimestamp(new Date(userInfo!.hourly.getTime()))
            message.channel.send({embeds: [embed]})
            return
        }
        const amount = randomRange(50, 100)
        const embed = new MessageEmbed()
        .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
        .setDescription(`\`${amount}\`<:Gold:955006535472410654> altın bakiyene eklendi! İyi düellolar`)
        .setColor("DARK_GREEN")
        message.channel.send({embeds: [embed]})
        await client.DBUser.findOneAndUpdate({_id: message.author.id}, {$set: {hourly: new Date().setHours(new Date().getHours() + 1)}, $inc: {balance: amount}})
    }
} as commandBase