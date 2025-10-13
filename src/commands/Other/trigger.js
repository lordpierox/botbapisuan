const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { DIG } = require('discord-image-generation');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trigger')
        .setDescription('Crea una imagen triggered')
        .addUserOption(option => option
            .setName('usuario')
            .setDescription('Usuario a triggear')
            .setRequired(false)),
    
    async execute(interaction, client) {
        await interaction.deferReply();
        
        const user = interaction.options.getUser('usuario') || interaction.user;
        const avatar = user.displayAvatarURL({ extension: 'png', size: 512 });
        
        try {
            const img = await new DIG.Triggered().getImage(avatar);
            const attachment = new AttachmentBuilder(img, { name: 'triggered.gif' });
            
            await interaction.followUp({ files: [attachment] });
        } catch (error) {
            console.error(error);
            await interaction.followUp('Error al generar la imagen!');
        }
    }
};
