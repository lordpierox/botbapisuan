// src/commands/other/wasted.js
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { DIG } = require('discord-image-generation');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wasted')
        .setDescription('Efecto GTA Wasted')
        .addUserOption(option => option
            .setName('usuario')
            .setDescription('Usuario')
            .setRequired(false)),
    
    async execute(interaction, client) {
        await interaction.deferReply();
        
        const user = interaction.options.getUser('usuario') || interaction.user;
        const avatar = user.displayAvatarURL({ extension: 'png', size: 512 });
        
        try {
            const img = await new DIG.Wasted().getImage(avatar);
            const attachment = new AttachmentBuilder(img, { name: 'wasted.png' });
            
            await interaction.followUp({ files: [attachment] });
        } catch (error) {
            await interaction.followUp('Error al generar la imagen!');
        }
    }
};
