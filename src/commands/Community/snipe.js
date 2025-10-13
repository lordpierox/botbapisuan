const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('snipe')
        .setDescription('Mostra l\'ultimo messaggio cancellato'),

    async execute(interaction, client) {
        if (!global.snipe || global.snipe.length === 0) {
            await interaction.reply({ 
                content: 'Non ci sono messaggi da snipare', 
                ephemeral: true 
            });
            return;
        }

        // Cerca l'ultimo messaggio cancellato in questo canale
        const channelSnipes = global.snipe.filter(s => s.chan === interaction.channel.id);
        
        if (channelSnipes.length === 0) {
            await interaction.reply({ 
                content: 'Non ci sono messaggi cancellati in questo canale', 
                ephemeral: true 
            });
            return;
        }

        const lastSnipe = channelSnipes[channelSnipes.length - 1];
        const user = await client.users.fetch(lastSnipe.user);

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
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

        await interaction.reply({ embeds: [embed] });
    },
};
