// src/commands/other/jail.js
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { DIG } = require('discord-image-generation');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jail')
        .setDescription('Mete a alguien en la cárcel')
        .addUserOption(option => option
            .setName('usuario')
            .setDescription('Usuario a encarcelar')
            .setRequired(false)),
    
    async execute(interaction, client) {
        await interaction.deferReply();
        
        const user = interaction.options.getUser('usuario') || interaction.user;
        const avatar = user.displayAvatarURL({ extension: 'png', size: 512 });
        
        try {
            const img = await new DIG.Jail().getImage(avatar);
            const attachment = new AttachmentBuilder(img, { name: 'jail.png' });
            
            await interaction.followUp({ 
                content: `${user.username} está en la cárcel! 🚔`,
                files: [attachment] 
            });
        } catch (error) {
            await interaction.followUp('Error al generar la imagen!');
        }
    }
};
