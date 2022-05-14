import { SettClient } from "../types"
import userSchema from "../schemas/userSchema.js"
import { TextChannel } from "discord.js"

const fetchTopMembers = async() => {
    let text = 'Sende arenaların kralı olmak istiyor musun? O zaman hemen düelloya başla!\n\n'
    const results = await userSchema.find({}).sort({win: -1}).limit(10)
    for(let counter = 0; counter < results.length; counter++) {
        const result = results[counter]
        if(result.win === 0) continue
        text += `#${counter + 1}. <@${result._id}> şu ana kadar **${result.win}** düello kazamış!\n\n`
    }
    text += "Bu mesaj her 10 dakikada bir yenilenecektir."
    return text
}

const updateLeaderboard = async (client: SettClient) => {
    const channel = client.channels.cache.get("868077575954661377") as TextChannel
    if(!channel) return
    const top = await fetchTopMembers()
    const repeatMessage = async() => {
        let sentMessage = (await channel.messages.fetch()).first()

        if(!sentMessage) {
            sentMessage = await channel.send(top)
        }
        if(sentMessage.content.startsWith("Sende arenaların kralı olmak istiyor musun? O zaman hemen düelloya başla!")) {
            if(sentMessage.author.id === client.user?.id) {
                sentMessage.edit(top)
            } else {
                sentMessage.delete()
                repeatMessage()
            }
        } else {
            await channel.send(top)
        }
    }
    await repeatMessage()
    setTimeout(async () => { await updateLeaderboard(client) }, 1000 * 60 * 10)
}

export default async(client: SettClient) => {
    await updateLeaderboard(client)
}