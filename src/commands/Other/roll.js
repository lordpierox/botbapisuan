// src/commands/other/roll.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Lanza dados (ej: 1d20, 2d6)')
        .addStringOption(option => option
            .setName('dados')
            .setDescription('Formato: NdX (ej: 1d20, 2d6)')
            .setRequired(true)),
    
    async execute(interaction, client) {
        const input = interaction.options.getString('dados');
        const match = input.match(/^(\d+)d(\d+)$/i);
        
        if (!match) {
            return await interaction.reply({ content: '¡Formato no válido! Usa NdX (ej: 1d20)', ephemeral: true });
        }
        
        const num = parseInt(match[1]);
        const sides = parseInt(match[2]);
        
        if (num > 100 || sides > 1000) {
            return await interaction.reply({ content: '¡Demasiados dados o caras!', ephemeral: true });
        }
        
        const rolls = [];
        let total = 0;
        
        for (let i = 0; i < num; i++) {
            const roll = Math.floor(Math.random() * sides) + 1;
            rolls.push(roll);
            total += roll;
        }
        
        const embed = new EmbedBuilder()
            .setColor('#DC143C')
            .setTitle(`🎲 ${input}`)
            .setDescription(`**Resultados**: ${rolls.join(', ')}\n**Total**: ${total}`)
            .setFooter({ text: `Lanzado por ${interaction.user.username}` });
        
        await interaction.reply({ embeds: [embed] });
    }
};
