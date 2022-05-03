import { MessageReaction, User } from "discord.js";
import { SettClient } from "../types";
import emojiRoles from '../emojiRoles.json' assert {type: 'json'};
interface rolesType {
    [key: string]: Record<string, string>
}

const roles = emojiRoles as rolesType

export default async(_client: SettClient, reaction: MessageReaction, user: User) => {
    console.log(reaction.emoji.id)
    if(reaction.message.channel.type !== "GUILD_TEXT") return
    if(user.bot) return
    if(!reaction.message.guild!.me!.permissions.has("MANAGE_ROLES")) return

    const member = await reaction.message.guild!.members.fetch(user.id)

    if(!Object.prototype.hasOwnProperty.call(roles, reaction.message.channel.id)) return

    const allRoles = roles[reaction.message.channel.id]

    if(reaction.message.partial) await reaction.message.fetch()

    const message = "Seçilebilecek rol listesi:"
    if(!reaction.message.content?.startsWith(message)) return
    if(!Object.prototype.hasOwnProperty.call(allRoles, reaction.emoji.id || reaction.emoji.name)) return reaction.users.remove(user.id)

    const role = reaction.message.guild!.roles.cache.get(allRoles[reaction.emoji.id! || reaction.emoji.name!])

    if(!role) return reaction.remove()

    if(member.roles.cache.has(role.id)) {
        await member.roles.remove(role)
    } else {
        await member.roles.add(role)
    }
    await reaction.users.remove(user.id)
}