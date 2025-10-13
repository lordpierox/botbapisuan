const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('snipebot')
        .setDescription('Mostra l\'ultimo messaggio di bot cancellato'),

    async execute(interaction, client) {
        if (!global.snipe_bot || global.snipe_bot.length === 0) {
            await interaction.reply({ 
                content: 'Non ci sono messaggi bot da snipare', 
                ephemeral: true 
            });
            return;
        }

        // Cerca l'ultimo messaggio bot cancellato in questo canale
        const channelSnipes = global.snipe_bot.filter(s => s.chan === interaction.channel.id);
        
        if (channelSnipes.length === 0) {
            await interaction.reply({ 
                content: 'Non ci sono messaggi bot cancellati in questo canale', 
                ephemeral: true 
            });
            return;
        }

        const lastSnipe = channelSnipes[channelSnipes.length - 1];
        const user = await client.users.fetch(lastSnipe.user);

        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setAuthor({ 
                name: user.username, 
                iconURL: user.displayAvatarURL() 
            })
            .setDescription(lastSnipe.cont || 'Nessun contenuto testuale')
            .setTimestamp(lastSnipe.date)
            .setFooter({ text: `Sniped by ${interaction.user.username}` });

        if (lastSnipe.url) {
            embed.setImage(lastSnipe.url);
        }

        // Se c'è un embed originale, aggiungilo
        if (lastSnipe.embed && lastSnipe.embed.length > 0) {
            await interaction.reply({ 
                embeds: [embed, ...lastSnipe.embed] 
            });
        } else {
            await interaction.reply({ embeds: [embed] });
        }
    },
};
