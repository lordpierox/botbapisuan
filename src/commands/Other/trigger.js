const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('triggered')
        .setDescription('Genera un GIF triggered')
        .addUserOption(option => 
            option.setName('utente')
                .setDescription('Utente da triggerare')
                .setRequired(false)),
    
    async execute(interaction) {
        await interaction.deferReply();
        
        const user = interaction.options.getUser('utente') || interaction.user;
        const avatar = user.displayAvatarURL({ extension: 'png', size: 512 });
        
        const url = `https://api.popcat.xyz/triggered?image=${encodeURIComponent(avatar)}`;
        
        try {
            const response = await axios.get(url, { 
                responseType: 'arraybuffer',
                timeout: 10000
            });
            
            const attachment = new AttachmentBuilder(Buffer.from(response.data), { 
                name: 'triggered.gif' 
            });
            
            await interaction.editReply({ files: [attachment] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('Errore nel generare l\'immagine');
        }
    }
};
