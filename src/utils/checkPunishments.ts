import { SettClient } from "../types";
import modlog from "./modlog.js";
import punishmentSchema from "../schemas/punishmentSchema.js";

export default async(client: SettClient) => {
    const check = async() => {
        const query = {
            expires: { $lt: new Date()},
        }
        const results = await punishmentSchema.find(query)

        for(const result of results) {
            const {userId, type, staffId, createdAt, expires} = result
            const guild = await client.guilds.fetch("guild id")
            const member = guild.members.cache.get(userId)
            const staff = guild.members.cache.get(staffId)
            if(type == "ban") {
                guild.members.unban(userId, "Ban süresi doldu")
                modlog(guild, userId, "BAN_SÜRESİ", staff ? staff : staffId, "Ban süresi doldu", new Date(expires).getTime() - new Date(createdAt).getTime())
            } else if(type == "mute"){
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