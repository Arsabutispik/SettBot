import { MessageEmbed } from "discord.js";
import { commandBase } from "../../types";

export default {
    name: "yardım",
    description: "Bot komutları ile yardımcı olur",
    usage: "s!yardım [kategori|komut ismi]",
    execute({client, message, args}) {
        if(args.length == 0){
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RANDOM")
            .addFields({
                name: "Kategoriler",
                value: `\`${client.categories.map(val => val).join(", ")}\``
            }, {
                name: "Komutlar",
                value: `\`${client.commands.map(val => val.name).join(", ")}\``
            })
            .setTimestamp()
            message.channel.send({embeds: [embed]})
            return
        }
        const comOrCategory = args[0]
        if(client.commands.has(comOrCategory)){
            const command = client.commands.get(args[0]) as commandBase
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RANDOM")
            .addFields({
                name: "Komut Adı",
                value: command.name
            },
            {
                name: "Komut Açıklaması",
                value: command.description
            })
            .setFooter({text: "<> gereklidir [] isteğe bağlıdır, | diğer kullanım şeklini gösterir"})
            command.usage ? embed.addField("Komut Kullanımı", command.usage) : embed.addField("Komut Kullanımı", "Bir kullanım verilmemiştir.") 
            command.examples ? embed.addField("Kullanım Örnekleri", command.examples) : embed.addField("Kullanım Örnekleri", "Bir örnek verilmemiştir") 
            message.channel.send({embeds: [embed]})
        } else if(client.categories.has(comOrCategory)){
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RANDOM")
            .setDescription(`\`${client.categories.map(val => val).join(", ")}\``)
            message.channel.send({embeds: [embed]})
        } else {
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RANDOM")
            .addFields({
                name: "Kategoriler",
                value: `\`${client.categories.map(val => val).join(", ")}\``
            }, {
                name: "Komutlar",
                value: `\`${client.commands.map(val => val.name).join(", ")}\``
            })
            .setTimestamp()
            message.channel.send({embeds: [embed]})
            return
        }
    }
} as commandBase