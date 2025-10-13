// src/commands/other/avatar.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Muestra el avatar de un usuario')
        .addUserOption(option => option
            .setName('usuario')
            .setDescription('Usuario del que ver el avatar')
            .setRequired(false)),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('usuario') || interaction.user;
        
        const embed = new EmbedBuilder()
            .setColor('#DC143C')
            .setTitle(`Avatar de ${user.username}`)
            .setImage(user.displayAvatarURL({ size: 1024 }))
            .setDescription(`[Enlace directo](${user.displayAvatarURL({ size: 1024 })})`);
        
        await interaction.reply({ embeds: [embed] });
    }
};
