// src/commands/other/pixelate.js
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const sharp = require('sharp');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pixelate')
        .setDescription('Pixela el avatar de un usuario')
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
            
            const pixelated = await sharp(Buffer.from(buffer))
                .resize(16, 16, { kernel: sharp.kernel.nearest })
                .resize(512, 512, { kernel: sharp.kernel.nearest })
                .toBuffer();
            
            const attachment = new AttachmentBuilder(pixelated, { name: 'pixelate.png' });
            await interaction.followUp({ files: [attachment] });
        } catch (error) {
            await interaction.followUp('Error al procesar la imagen!');
        }
    }
};
