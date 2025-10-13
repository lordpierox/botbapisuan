// src/commands/community/serverinfo.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Muestra información del servidor'),
    
    async execute(interaction, client) {
        const guild = interaction.guild;
        
        const embed = new EmbedBuilder()
            .setColor('#DC143C')
            .setTitle(`📊 ${guild.name}`)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: '👑 Propietario', value: `<@${guild.ownerId}>`, inline: true },
                { name: '🆔 ID', value: guild.id, inline: true },
                { name: '👥 Miembros', value: `${guild.memberCount}`, inline: true },
                { name: '📝 Canales de texto', value: `${guild.channels.cache.filter(c => c.type === 0).size}`, inline: true },
                { name: '🔊 Canales de voz', value: `${guild.channels.cache.filter(c => c.type === 2).size}`, inline: true },
                { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
                { name: '📅 Creado el', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: false }
            )
            .setFooter({ text: `Solicitado por ${interaction.user.username}` })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};
