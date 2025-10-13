// src/commands/community/clear.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Borra mensajes del canal')
        .addIntegerOption(option => option
            .setName('cantidad')
            .setDescription('Número de mensajes a borrar (1-100)')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction, client) {
        const amount = interaction.options.getInteger('cantidad');
        
        await interaction.channel.bulkDelete(amount, true);
        await interaction.reply({ 
            content: `✅ ¡${amount} mensajes borrados!`, 
            ephemeral: true 
        });
    }
};
