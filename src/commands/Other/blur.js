// src/commands/other/blur.js
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const sharp = require('sharp');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blur')
        .setDescription('Desenfoca el avatar de un usuario')
        .addUserOption(option => option
            .setName('usuario')
            .setDescription('Usuario')
            .setRequired(false))
        .addIntegerOption(option => option
            .setName('intensidad')
            .setDescription('Intensidad del blur (1-100)')
            .setMinValue(1)
            .setMaxValue(100)),
    
    async execute(interaction, client) {
        await interaction.deferReply();
        
        const user = interaction.options.getUser('usuario') || interaction.user;
        const blur = interaction.options.getInteger('intensidad') || 10;
        const avatar = user.displayAvatarURL({ extension: 'png', size: 512 });
        
        try {
            const response = await fetch(avatar);
            const buffer = await response.arrayBuffer();
            
            const blurred = await sharp(Buffer.from(buffer))
                .blur(blur)
                .toBuffer();
            
            const attachment = new AttachmentBuilder(blurred, { name: 'blur.png' });
            await interaction.followUp({ files: [attachment] });
        } catch (error) {
            await interaction.followUp('Error al procesar la imagen!');
        }
    }
};
