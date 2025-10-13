const sagiri = require('sagiri');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const sagiriclient = sagiri("a10473b382ec6bd5a8187816dfc48b3226a4a96b");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('saucelink')
        .setDescription('Cerca un\'immagine tramite link su SauceNAO')
        .addStringOption(option => option
            .setName('link')
            .setDescription('Link dell\'immagine')
            .setRequired(true)),

    async execute(interaction, client) {
        const link = interaction.options.getString("link");

        if (!interaction.channel.nsfw) {
            await interaction.reply({
                content: "Questo comando può essere usato solo in canali NSFW.",
                ephemeral: true
            });
            return;
        }

        try {
            await interaction.deferReply();
            
            const results = await sagiriclient(link);
            
            if (!results || results.length === 0) {
                await interaction.followUp({
                    content: "Nessun risultato trovato",
                    ephemeral: true
                });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle('SAUCE')
                .setDescription(`Link: ${results[0].url}\nSimilarity: ${results[0].raw.header.similarity}%`)
                .setURL(results[0].url)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setImage(results[0].raw.header.thumbnail);

            await interaction.followUp({ embeds: [embed] });
            
        } catch (e) {
            console.error(e);
            await interaction.followUp({
                content: "Errore nella ricerca dell'immagine",
                ephemeral: true
            });
        }
    },
};
