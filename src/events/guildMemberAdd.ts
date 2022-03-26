import { BaseGuildTextChannel, GuildMember, MessageEmbed } from 'discord.js';

export default async(member: GuildMember) => {
    const embed = new MessageEmbed()
    .setAuthor({name: member.user.tag, iconURL: member.user.displayAvatarURL({dynamic: true})})
    .setDescription(`Hoşgeldin ${member}! Düello izleyicileri seninle birlikte ${member.guild.memberCount} kişi oldu. Belki düellolara katılırsın?`)
    .setColor("RANDOM")
    .setTimestamp()

    const channel = await member.guild.channels.fetch("kanal id'si") as BaseGuildTextChannel
    channel.send({embeds: [embed]})
}