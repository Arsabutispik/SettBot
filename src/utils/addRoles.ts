import { SettClient } from "../types";
import emojiRoles from '../emojiRoles.json' assert {type: 'json'};
import { TextChannel } from "discord.js";
interface rolesType {
    [key: string]: Record<string, string>
}

const roles = emojiRoles as rolesType

export default(client: SettClient) => {
    Object.keys(roles).forEach(async channelId => {
        let message = "Seçilebilecek rol listesi:"
        const channel = client.channels.cache.get(channelId) as TextChannel
        if(!channel) return
        let emojiID: string[] = []
        const repeatMessage = async() => {
            let sentMessage = (await channel.messages.fetch()).first()
            if(!sentMessage) {
                sentMessage = await channel.send(message)
                emojiID.forEach(emojiId => {
                    sentMessage!.react(emojiId)
                })
                return
            }
            if(sentMessage.content === message) {
                if(sentMessage.author.id === client.user?.id) {
                    if(sentMessage.content === message) return
                    await sentMessage.edit(message)
                } else {
                    await sentMessage.delete()
                    await repeatMessage()
                }
            } else {
                sentMessage = await channel.send(message)
            }
            for (const emojiId of emojiID) {
                await sentMessage!.react(emojiId)
            }
        }
        Object.keys(roles[channelId]).forEach(emojiId => {
            emojiID.push(emojiId)
            const emoji = client.emojis.cache.get(emojiId) || emojiId
            const role = channel.guild.roles.cache.get(roles[channelId][emojiId])
            if(!role) return
            message += `\n${emoji}: \`${role.name}\``
        })
        await repeatMessage()

    })
}