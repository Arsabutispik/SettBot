import { MessageEmbed } from 'discord.js';
import {commandBase} from '../../types';

export default {
    name: "profil",
    category: "Bilgilendirici",
    description: "Bir kişinin veya kullanıcının profilini gösterir ya da profil oluşturur",
    usage: "s!profil [@kullanıcı|id]",
    examples: "s!profil <@950752419233542195>",
    async execute({client, message, args}) {
        if(args.length){
            let targetUser = message.mentions.members!.first() || message.guild!.members.cache.get(args[0])
            if(!targetUser) {
                const msg = await message.reply(`\`${args[0]}\` ile ilgili kimse bulunamadı. Doğru girdiğinize emin olun eğer kendi profilinize bakmak istiyorsanız \`s!profil\` veya \`@${client.user!.tag} profil\` ile kendi profilinize bakabilirsiniz`)
                setTimeout(() => {
                    msg.delete()
                }, 1000 * 3)
                return
            }
            const userInfo = await client.DBUser.findOne({_id: targetUser.id})
            if(!userInfo){
                const msg = await message.reply(`\`${targetUser.user.tag}\` Profil oluşturmamış.`)
                setTimeout(() => {
                    msg.delete()
                }, 1000 * 3)
                return
            }
            const embed = new MessageEmbed()
            .setAuthor({name: targetUser.user.tag, iconURL: targetUser.user.displayAvatarURL({dynamic: true})})
            .setColor("RANDOM")
            .setFields({
                name: "Altın <:Gold:955006535472410654>",
                value: userInfo.balance.toString()
            },
            {
                name: "Düello Kazanma 🥇",
                value: userInfo.win.toString()
            })
            message.channel.send({embeds: [embed]})
            return
        }
        const authorInfo = await client.DBUser.findOne({_id: message.author.id})
        if(!authorInfo){
            await client.DBUser.findOneAndUpdate({_id: message.author.id}, {}, {setDefaultsOnInsert: true, upsert: true})
            const msg = await message.reply("Profiliniz oluşturulmuştur komutu tekrar yazarak bakabilirsiniz.")
            setTimeout(() => {
                msg.delete()
            }, 1000 * 3)
            return
        }
        const embed = new MessageEmbed()
        .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
        .setColor("RANDOM")
        .setFields({
            name: "Altın <:Gold:955006535472410654>",
            value: authorInfo.balance.toString()
        },
        {
            name: "Düello Kazanma 🥇",
            value: authorInfo.win.toString()
        })
        message.channel.send({embeds: [embed]})
    }
} as commandBase