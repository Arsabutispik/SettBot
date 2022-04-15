import { SettClient } from "../types";

import punishmentSchema from "../schemas/punishmentSchema.js";

export default async(client: SettClient) => {
    const check = async() => {
        const query = {
            expires: { $lt: new Date()},
        }
        const results = await punishmentSchema.find(query)

        for(const result of results) {
            const {userId, type} = result
            const guild = await client.guilds.fetch("guild id")
            if(type == "ban") {
                guild.members.unban(userId, "Ban süresi doldu")
            } else if(type == "mute"){
                const member = guild.members.cache.get(userId)
                if(!member){
                    continue
                }
                member.roles.remove("rol id")
            }

        }
        await punishmentSchema.deleteMany(query)
        setTimeout(check, 1000 * 60 * 5)
    }
    await check()
}