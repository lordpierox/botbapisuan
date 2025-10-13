// src/commands/community/poll.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Crea una encuesta')
        .addStringOption(option => option
            .setName('pregunta')
            .setDescription('La pregunta de la encuesta')
            .setRequired(true)),
    
    async execute(interaction, client) {
        const question = interaction.options.getString('pregunta');
        
        const message = await interaction.reply({ 
            content: `📊 **ENCUESTA**\n${question}`,
            fetchReply: true 
        });
        
        await message.react('👍');
        await message.react('👎');
        await message.react('🤷');
    }
};
