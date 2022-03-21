import { BaseGuildTextChannel, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed, User } from 'discord.js';
import { duellerInfo, SettClient } from '../types';
import { randomRange } from './utils.js';

const duellerInfo: duellerInfo = {
    hp: 100,
    defence: false,
    heal: 5
    
}
const attackButton = new MessageButton()
.setCustomId("saldır")
.setEmoji("⚔️")
.setDisabled(false)
.setStyle("DANGER")

const defenseButton = new MessageButton()
.setCustomId("savun")
.setEmoji("🛡️")
.setDisabled(false)
.setStyle("PRIMARY")

const healButton = new MessageButton()
.setCustomId("can doldur")
.setEmoji("❤️")
.setDisabled(false)
.setStyle("SUCCESS")

const ultiButton = new MessageButton()
.setCustomId("ulti")
.setEmoji("🎯")
.setDisabled(false)
.setStyle("DANGER")

const escapeButton = new MessageButton()
.setCustomId("kaç")
.setEmoji("🏃‍♂️")
.setDisabled(false)
.setStyle("SECONDARY")

const actionRow = new MessageActionRow()
.addComponents(attackButton, defenseButton, healButton, ultiButton, escapeButton)

const attackMessage: Array<{message: string, url: string}> = [
    {
        message: "\`{attacker}\`, Sett'in *Balyoz Gibi* yeteneğini kullanarak \`{defender}\` kişisine \`{damage}\` hasar verdi!",
        url: "https://cdn.discordapp.com/attachments/933095626844037224/954857672153370674/settW33.gif"
    },
    {
        message: "\`{attacker}\`, Warwick'in *Cani Diş* yeteneğini kullanarak \`{defender} kişisine \`{damage}\` hasar verdi!",
        url: "https://cdn.discordapp.com/attachments/933095626844037224/954857671448735744/WWW.gif"
    }
]

const ultiMessage: Array<{message: string, url: string}> = [
    {
        message: "\`{attacker}\`, Sett'in *Yürek Hoplatan* yeteneğini kullanarak \`{defender}\` kişisine \`{damage}\` hasar verdi!",
        url: "https://cdn.discordapp.com/attachments/933095626844037224/954857671771705344/SETTR.gif"
    },
    {
        message: "\`{attacker}\`, Sylas'ın *Gasp* yeteneği ile \`{defender}\` kişisinin ultisini çalıp, ultisi ile \`{damage}\` hasar verdi!",
        url: "https://cdn.discordapp.com/attachments/933095626844037224/954857672472166471/SYLASR.gif"
    }
]

const defenceMessage: Array<{message: string, url: string}> = [
    {
        message: "\`{attacker}\`, Janna'nın *Fırtınanın Gözü* yeteneği sayesinde \`{defender}\` kişisinin bir sonraki saldırısı daha az vuracak.",
        url: "https://cdn.discordapp.com/attachments/933095626844037224/955011966311759922/jannae.gif"
    },
    {
        message: "\`{attacker}\`, Morgana'nın *Kara Kalkan* yeteneği sayesinde \`{defender}\` kişisinin bir sonraki saldırısı daha az vuracak.",
        url: "https://cdn.discordapp.com/attachments/933095626844037224/955015678820253726/morganae.gif"
    }
]

const healMessage: Array<{message: string, url: string}> = [
    {
        message: "\`{attacker}\`, Yuumi'nin *Çıldırrr* yeteneği ile can doldurdu.",
        url: "https://cdn.discordapp.com/attachments/933095626844037224/955017773103337512/yuumie.gif"
    }
]

function replaceMessage(message: string, attacker: User, deffender: User, damage: number): string {
        return message.replaceAll('{attacker}', attacker.username).replaceAll('{defender}', deffender.username).replaceAll('{damage}', damage.toString())
}

const duelHandler = async(client: SettClient, attacker: User, defender: User, channel: BaseGuildTextChannel, amount: number): Promise<User | undefined> => {
    if(!client.duelInfo.hasAll(attacker.id, defender.id)) {
        client.duelInfo.set(attacker.id, duellerInfo)
        client.duelInfo.set(defender.id, duellerInfo)
    }
    

    const attackerInfo = client.duelInfo.get(attacker.id)
    const defenderInfo = client.duelInfo.get(defender.id)

    const embed = new MessageEmbed()
    .setAuthor({name: attacker.tag, iconURL: attacker.displayAvatarURL()})
    .setColor("YELLOW")
    .setDescription(`${attacker} Saldırı sırası sende!\nSaldır ⚔️\nSavun 🛡️\nCan Doldur(${attackerInfo!.heal}) ❤️\nUlti 🎯\nKaç 🏃‍♂️`)
    .setFooter({text: `Can: ${attackerInfo!.hp} Düşman Canı: ${defenderInfo!.hp}`, iconURL: client.user!.displayAvatarURL()})
    
    const msg = await channel.send({embeds: [embed], components: [actionRow]})

    const filter = (m: MessageComponentInteraction) => m.customId == "saldır" || m.customId == "savun" || m.customId == "can doldur" || m.customId == "kaç" || m.customId == "ulti"
    
    let response: MessageComponentInteraction;
    try {
        response = (await channel.awaitMessageComponent({filter, time: 300000})) as MessageComponentInteraction
    } catch {
        const embed = new MessageEmbed()
            .setColor("RED")
            .setDescription("Saldıran kişi 5 dakika boyunca yanıt vermediği için düello iptal edilmiştir.")
            .setFooter({text: client.user!.tag, iconURL: client.user!.displayAvatarURL()})
            channel.send({embeds: [embed]})
            client.duelChannel.delete(channel.id)
            client.duelInfo.delete(attacker.id)
            client.duelInfo.delete(defender.id)
            msg.delete()
            return
    }
    let damage = randomRange(10, 20)
    const chance = randomRange(0, 100)

    switch (response.customId as "saldır" | "savun" | "can doldur" | "ulti" | "kaç") {
        case "saldır":
            const message = attackMessage[randomRange(0, attackMessage.length - 1)]
            if(defenderInfo!.defence) {
                damage = randomRange(5, 15)
                if(defenderInfo!.hp < damage){
                    const embed = new MessageEmbed()
                    .setAuthor({name: attacker.tag, iconURL: attacker.displayAvatarURL()})
                    .setDescription(replaceMessage(message.message, attacker, defender, damage))
                    .setImage(message.url)
                    .setColor("RANDOM")
                    const mesg = await channel.send({embeds: [embed]})
                    setTimeout(() => {
                        mesg.delete()
                    }, 1000 * 10)

                    client.duelInfo.delete(attacker.id)
                    client.duelInfo.delete(defender.id)
                    msg.delete()
                    return attacker
                }
                const embed = new MessageEmbed()
                .setAuthor({name: attacker.tag, iconURL: attacker.displayAvatarURL()})
                .setDescription(replaceMessage(message.message, attacker, defender, damage))
                .setImage(message.url)
                .setColor("RANDOM")
                const mesg = await channel.send({embeds: [embed]})
                setTimeout(() => {
                    mesg.delete()
                }, 1000 * 10)
                client.duelInfo.delete(defender.id)
                client.duelInfo.set(defender.id, {hp: defenderInfo!.hp - damage, defence: false, heal: defenderInfo!.heal})
                msg.delete()
                duelHandler(client,  defender, attacker, channel, amount)

            } else {
                if(defenderInfo!.hp < damage){
                    const embed = new MessageEmbed()
                    .setAuthor({name: attacker.tag, iconURL: attacker.displayAvatarURL()})
                    .setDescription(replaceMessage(message.message, attacker, defender, damage))
                    .setImage(message.url)
                    .setColor("RANDOM")
                    const mesg = await channel.send({embeds: [embed]})
                    setTimeout(() => {
                        mesg.delete()
                    }, 1000 * 10)
                    client.duelInfo.delete(attacker.id)
                    client.duelInfo.delete(defender.id)
                    msg.delete()
                    return attacker
                }

                const embed = new MessageEmbed()
                .setAuthor({name: attacker.tag, iconURL: attacker.displayAvatarURL()})
                .setDescription(replaceMessage(message.message, attacker, defender, damage))
                .setImage(message.url)
                .setColor("RANDOM")
                const mesg = await channel.send({embeds: [embed]})
                setTimeout(() => {
                    mesg.delete()
                }, 1000 * 10)

                client.duelInfo.delete(defender.id)
                client.duelInfo.set(defender.id, {hp: defenderInfo!.hp - damage, defence: false, heal: defenderInfo!.heal})
                msg.delete()
                duelHandler(client,  defender, attacker, channel, amount)
            }
            break
        
        case "savun":
            if(duellerInfo.defence){
                duelHandler(client, defender, attacker, channel, amount)
                return
            }

            const defmessage = defenceMessage[randomRange(0, attackMessage.length - 1)]

            const embed = new MessageEmbed()
            .setAuthor({name: attacker.tag, iconURL: attacker.displayAvatarURL()})
            .setDescription(replaceMessage(defmessage.message, attacker, defender, damage))
            .setImage(defmessage.url)
            .setColor("RANDOM")
            const mesg = await channel.send({embeds: [embed]})
            setTimeout(() => {
                mesg.delete()
            }, 1000 * 10)

            client.duelInfo.delete(attacker.id)
            client.duelInfo.set(attacker.id, {...duellerInfo, defence: true})
            msg.delete()
            duelHandler(client, defender, attacker, channel, amount)
            break
        
        case "can doldur":
            const healmessage = healMessage[randomRange(0, attackMessage.length - 1)]
            if(duellerInfo.heal == 0){
                const msg2 = await channel.send(`${attacker}, Can basmak için pot'un kalmadı başka bir hamle dene!`)
                setTimeout(() => {
                    msg2.delete()
                }, 1000 * 5)
                msg.delete()
                duelHandler(client, attacker, defender, channel, amount)
                return
            }
            const embed2 = new MessageEmbed()
            .setAuthor({name: attacker.tag, iconURL: attacker.displayAvatarURL()})
            .setDescription(replaceMessage(healmessage.message, attacker, defender, damage))
            .setImage(healmessage.url)
            .setColor("RANDOM")
            const messg = await channel.send({embeds: [embed2]})
            setTimeout(() => {
                messg.delete()
            }, 1000 * 10)

            client.duelInfo.delete(attacker.id)
            client.duelInfo.set(attacker.id, {...duellerInfo, hp: duellerInfo.hp + 20, heal: duellerInfo.heal - 1})
            msg.delete()
            duelHandler(client,  defender, attacker, channel, amount)
            break
        case "ulti":
            if(chance >= 60){
                const message = ultiMessage[randomRange(0, attackMessage.length - 1)]
                if(defenderInfo!.defence) {
                    damage = randomRange(15, 35)

                    if(defenderInfo!.hp < damage){
                        const embed = new MessageEmbed()
                        .setAuthor({name: attacker.tag, iconURL: attacker.displayAvatarURL()})
                        .setDescription(replaceMessage(message.message, attacker, defender, damage))
                        .setImage(message.url)
                        .setColor("RANDOM")
                        const mesg = await channel.send({embeds: [embed]})
                        setTimeout(() => {
                            mesg.delete()
                        }, 1000 * 10)

                        client.duelInfo.delete(attacker.id)
                        client.duelInfo.delete(defender.id)
                        msg.delete()
                        return attacker
                    }

                    const embed = new MessageEmbed()
                    .setAuthor({name: attacker.tag, iconURL: attacker.displayAvatarURL()})
                    .setDescription(replaceMessage(message.message, attacker, defender, damage))
                    .setImage(message.url)
                    .setColor("RANDOM")
                    const mesg = await channel.send({embeds: [embed]})
                    setTimeout(() => {
                        mesg.delete()
                    }, 1000 * 10)

                    client.duelInfo.delete(defender.id)
                    client.duelInfo.set(defender.id, {hp: defenderInfo!.hp - damage, defence: false, heal: defenderInfo!.heal})
                    msg.delete()
                    duelHandler(client,  defender, attacker, channel, amount)
                } else {
                    damage = randomRange(20, 45)
                    if(defenderInfo!.hp < damage){
                        const embed = new MessageEmbed()
                        .setAuthor({name: attacker.tag, iconURL: attacker.displayAvatarURL()})
                        .setDescription(replaceMessage(message.message, attacker, defender, damage))
                        .setImage(message.url)
                        .setColor("RANDOM")
                        const mesg = await channel.send({embeds: [embed]})
                        setTimeout(() => {
                            mesg.delete()
                        }, 1000 * 10)

                        client.duelInfo.delete(attacker.id)
                        client.duelInfo.delete(defender.id)
                        msg.delete()
                        return attacker
                    }

                    const embed = new MessageEmbed()
                    .setAuthor({name: attacker.tag, iconURL: attacker.displayAvatarURL()})
                    .setDescription(replaceMessage(message.message, attacker, defender, damage))
                    .setImage(message.url)
                    .setColor("RANDOM")
                    const mesg = await channel.send({embeds: [embed]})
                    setTimeout(() => {
                        mesg.delete()
                    }, 1000 * 10)

                    client.duelInfo.delete(defender.id)
                    client.duelInfo.set(defender.id, {hp: defenderInfo!.hp - damage, defence: false, heal: defenderInfo!.heal})
                    msg.delete()
                    duelHandler(client,  defender, attacker, channel, amount)
                }
            } else {
                const msg2 = await channel.send(`${attacker}, Ulti'yi kaçırdın! Daha sonra tekrar dene.`)
                setTimeout(() => {
                    msg2.delete()
                }, 1000 * 5)
                msg.delete()
                duelHandler(client,  defender, attacker, channel, amount)
            }
            break

        case "kaç":
            const embed3 = new MessageEmbed()
            .setAuthor({name: attacker.tag, iconURL: attacker.displayAvatarURL()})
            .setDescription(`\`${attacker.username}\` düellodan korkak gibi kaçtı! \`${defender.username}\` Oyunu kazandı.`)
            .setImage("https://cdn.discordapp.com/attachments/933095626844037224/955024824026157066/jinxbase.gif")
            .setColor("RANDOM")
            const messg2 = await channel.send({embeds: [embed3]})
            setTimeout(() => {
                messg2.delete()
            }, 1000 * 10)
            client.duelInfo.delete(attacker.id)
            client.duelInfo.delete(defender.id)
            msg.delete()
            return defender

    }
    return
}

export default duelHandler