// src/commands/community/userinfo.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Muestra información sobre un usuario')
        .addUserOption(option => option
            .setName('usuario')
            .setDescription('Usuario a consultar')
            .setRequired(false)),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('usuario') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);
        
        const embed = new EmbedBuilder()
            .setColor('#DC143C')
            .setTitle(`Información de ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: '👤 Nombre', value: user.tag, inline: true },
                { name: '🆔 ID', value: user.id, inline: true },
                { name: '📅 Cuenta creada', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: false },
                { name: '📥 Se unió al servidor', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: false },
                { name: '🎭 Roles', value: member.roles.cache.map(r => r).join(' ').replace('@everyone', '') || 'Ninguno', inline: false }
            )
            .setFooter({ text: `Solicitado por ${interaction.user.username}` })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};
