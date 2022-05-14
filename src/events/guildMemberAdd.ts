import { BaseGuildTextChannel, GuildMember, MessageEmbed } from 'discord.js';
import { SettClient } from '../types';
import punishmentSchema from '../schemas/punishmentSchema.js';
import config from '../config.json' assert {type: 'json'};
export default async(_client: SettClient, member: GuildMember) => {
    const punishment = await punishmentSchema.findOne({userId: member.id, type: 'mute'})
    if(punishment){
        member.roles.add(config.MUTE_ROLE)
    }
    const embed = new MessageEmbed()
    .setAuthor({name: member.user.tag, iconURL: member.user.displayAvatarURL({dynamic: true})})
    .setDescription(`Arenaya hoşgeldin ${member}! Düello izleyicileri seninle birlikte ${member.guild.memberCount} kişi oldu. Belki düellolara katılırsın?`)
    .setColor("RANDOM")
    .setTimestamp()
    .setImage("https://c.tenor.com/Z0IZ_YWXD3wAAAAC/sett-league-of-legends.gif")
    
    const channel = await member.guild.channels.fetch("kanal id'si") as BaseGuildTextChannel
    channel.send({embeds: [embed]})
    member.roles.add("id")
}