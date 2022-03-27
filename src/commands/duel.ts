import { BaseGuildTextChannel, Message, MessageEmbed, User } from "discord.js";
import { commandBase } from "../types";
import duelHandler from "../utils/duelHandler.js";
import { randomRange } from "../utils/utils.js";
import duelChannels from '../duelChannels.json' assert {type: 'json'};


export default {
    name: "düello",
    category: "Eğlence",
    async execute({message, client, args}) {
        if(!duelChannels.includes(message.channel.id)){
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setDescription("Bu kanalda düello yapmak yasaktır. Lütfen şu kanallarda düello yapınız:")
            .addField("Düello İzni Verilen Kanallar", duelChannels.length > 0 ? duelChannels.map(m => {`<#${m}>`}).join(', '): "Hiç.")
            .setColor("DARK_RED")
            message.channel.send({embeds: [embed]}).then(msg => {
                setTimeout(() => {
                    msg.delete()
                }, 1000, 15)
            })
            message.delete()
        }
        if(client.duelChannel.has(message.channel.id)){
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RED")
            .setDescription(`Bu kanalda zaten bir düello var veya bekleyen bir düello var.`)
            message.channel.send({embeds: [embed]})
            return;
        }
        if(args.length == 0 || args.length > 1) {
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RED")
            .setDescription(`Lütfen bir düello altın miktarı veriniz ya da düello miktarı dışında bir şey yazmayınız.`)
            message.channel.send({embeds: [embed]})
            return;
        }
        const amount = Number(args[0])

        if(isNaN(amount)){
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RED")
            .setDescription(`Verilen düello altın miktarı bir sayı değil.`)
            message.channel.send({embeds: [embed]})
            return;
        }

        const attackerInfo = await client.DBUser.findOne({_id: message.author.id})

        if(!attackerInfo) {
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RED")
            .setDescription(`${message.author.username}, profiliniz oluşturulmamıştır lütfen \`s!profil\` veya \`@${client.user!.tag} profil\` ile profilinizi oluşturun`)
            message.channel.send({embeds: [embed]})
            return;
        }
        
        if(attackerInfo.balance < amount) {
            const embed = new MessageEmbed()
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setColor("RED")
            .setDescription(`Verdiğiniz düello altın miktarı bütçenizi aşıyor lütfen daha az bir miktar giriniz.`)
            message.channel.send({embeds: [embed]})
            return;
        }

        const embed = new MessageEmbed()
        .setAuthor({name: client.user!.tag, iconURL: client.user!.displayAvatarURL({dynamic: true})})
        .setDescription(`${message.author.tag} düello başlattı! Düello bahsi \`${amount}\`<:Gold:955006535472410654> altın. Kazanan \`${amount}\`<:Gold:955006535472410654> altın alacak. Katılmak için \`evet\` yazınız`)
        .setFooter({text: "Düelloyu iptal etmek için iptal yazınız. (5 dakika sonra iptal olacak)", iconURL: message.author.displayAvatarURL()})
        message.channel.send({embeds: [embed]})
        let deffender: Message;
        const filter = (m: Message) => !m.author.bot && !m.webhookId && ((m.content.toLowerCase() == "evet" && m.author.id !== message.author.id) || m.content.toLowerCase() == "iptal")
        try {
            client.duelChannel.set(message.channel.id, true)
            deffender = (await message.channel.awaitMessages({filter, max: 1, time: 300000, errors: ['time']})).first() as Message
        } catch {
            const embed = new MessageEmbed()
            .setColor("RED")
            .setDescription("Düello 5 dakika kuralı yüzünden iptal edilmiştir.")
            .setFooter({text: client.user!.tag, iconURL: client.user!.displayAvatarURL({dynamic: true})})
            message.channel.send({embeds: [embed]})
            client.duelChannel.delete(message.channel.id)
            return
        }
        if(deffender.content.toLowerCase() == "iptal" && deffender.author.id == message.author.id) {
            const embed = new MessageEmbed()
            .setColor("RED")
            .setDescription("Düello, düello kurucu tarafından iptal edilmiştir.")
            .setFooter({text: client.user!.tag, iconURL: client.user!.displayAvatarURL({dynamic: true})})
            message.channel.send({embeds: [embed]})
            client.duelChannel.delete(message.channel.id)
            return
        }
        const deffenderInfo = await client.DBUser.findOne({_id: deffender.author.id})

        if(!deffenderInfo) {
            const embed = new MessageEmbed()
            .setAuthor({name: deffender.author.tag, iconURL: deffender.author.displayAvatarURL({dynamic: true})})
            .setColor("RED")
            .setDescription(`${deffender.author.username}, profiliniz oluşturulmamıştır lütfen \`s!profil\` veya \`@${client.user!.tag} profil\` ile profilinizi oluşturun`)
            message.channel.send({embeds: [embed]})
            client.duelChannel.delete(message.channel.id)
            return;
        }

        if(deffenderInfo.balance < amount) {
            const embed = new MessageEmbed()
            .setAuthor({name: deffender.author.tag, iconURL: deffender.author.displayAvatarURL({dynamic: true})})
            .setColor("RED")
            .setDescription(`Düello altın miktarı bütçenizi aşıyor. Düelloya giremezsiniz`)
            message.channel.send({embeds: [embed]})
            return;
        }
        let winner: User | undefined;
        const chance = randomRange(1, 2)

        if(chance == 1) {
            winner = await duelHandler(client, message.author, deffender.author, message.channel as BaseGuildTextChannel, amount)
        } else if (chance == 2) {
            winner = await duelHandler(client,  deffender.author, message.author, message.channel as BaseGuildTextChannel, amount)
        }
        if(winner){
            message.channel.send(`Düello bitmiştir! Düello kazananı ${winner} kişisidir ve ${amount}<:Gold:955006535472410654> altınla ayrılmıştır.`)
            await client.DBUser.findOneAndUpdate({_id: winner.id}, {$inc: {win: 1, balance: amount}})
            if(winner.id === message.author.id){
                await client.DBUser.findOneAndUpdate({_id: deffender.id}, {$inc: {balance: -amount}})
            } else {
                await client.DBUser.findOneAndUpdate({_id: message.author.id}, {$inc: {balance: -amount}})
            }
        }
    }
} as commandBase