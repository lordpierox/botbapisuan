// src/commands/other/invert.js
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const sharp = require('sharp');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invert')
        .setDescription('Invierte los colores del avatar')
        .addUserOption(option => option
            .setName('usuario')
            .setDescription('Usuario')
            .setRequired(false)),
    
    async execute(interaction, client) {
        await interaction.deferReply();
        
        const user = interaction.options.getUser('usuario') || interaction.user;
        const avatar = user.displayAvatarURL({ extension: 'png', size: 512 });
        
        try {
            const response = await fetch(avatar);
            const buffer = await response.arrayBuffer();
            
            const inverted = await sharp(Buffer.from(buffer))
                .negate()
                .toBuffer();
            
            const attachment = new AttachmentBuilder(inverted, { name: 'invert.png' });
            await interaction.followUp({ files: [attachment] });
        } catch (error) {
            await interaction.followUp('Error al procesar la imagen!');
        }
    }
};
