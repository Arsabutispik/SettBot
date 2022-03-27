import { BaseGuildTextChannel, GuildMember, MessageEmbed } from 'discord.js';
import { SettClient } from '../types';

export default async(_client: SettClient, member: GuildMember) => {
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