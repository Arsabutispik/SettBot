import { SettClient } from "../types";
import emojiRoles from '../emojiRoles.json' assert {type: 'json'};
import { TextChannel } from "discord.js";
interface rolesType {
    [key: string]: Record<string, string>
}

const roles = emojiRoles as rolesType

export default(client: SettClient) => {
    let message = "Seçilebilecek rol listesi:"
    Object.keys(roles).forEach(channelId => {
        const channel = client.channels.cache.get(channelId) as TextChannel
        if(!channel) return
        let emojiID: string[] = []
        Object.keys(roles[channelId]).forEach(emojiId => {
            emojiID.push(emojiId)
            const emoji = channel.guild.emojis.cache.get(emojiId)
            const role = channel.guild.roles.cache.get(roles[channelId][emojiId])
            if(!role) return
            if(!emoji) return
            message += `\n${emoji}: \`${role.name}\``
            
        })
        const repeatMessage = async() => {
            let sentMessage = channel.messages.cache.first()
            if(!sentMessage) return
            if(sentMessage.content === message) {
                if(sentMessage.author.id === client.user?.id) {
                    sentMessage.edit(message)
                } else {
                    sentMessage.delete()
                    repeatMessage()
                }
            } else {
                sentMessage = await channel.send(message)
            }
            emojiID.forEach(emojiId => {
                sentMessage!.react(emojiId)
            })
        }
        
    })
}