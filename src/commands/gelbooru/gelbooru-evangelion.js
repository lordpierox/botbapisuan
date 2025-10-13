const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { searchGelbooru } = require('../../utils/gelbooru');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gelbooru-evangelion')
        .setDescription('Cerca immagini Evangelion su Gelbooru')
        .addStringOption(option => option
            .setName('Tags')
            .setDescription('Selecciona los tags')
            .setRequired(true)
            .addChoices(
                { name: 'Asushin (Asuka x Shinji)', value: 'asushin' },
                { name: 'Asurei (Asuka x Rei)', value: 'asurei' },
                { name: 'Kaworei (Kaworu x Rei)', value: 'kaworei' },
                { name: 'Mariken (Mari x Kensuke)', value: 'mariken' },
                { name: 'Marishin (Mari x Shinji)', value: 'marishin' },
                { name: 'NSFW Asuka', value: 'nsfw_asuka' },
                { name: 'NSFW Mari', value: 'nsfw_mari' },
                { name: 'NSFW Misato', value: 'nsfw_misato' },
                { name: 'NSFW Rei', value: 'nsfw_rei' }
            ))
        .addStringOption(option => option
            .setName('sort')
            .setDescription('Ordenar por')
            .setRequired(true)
            .addChoices(
                { name: 'Random', value: 'sort:random' },
                { name: 'Calificacion', value: 'sort:score' },
                { name: 'Mas Recientes', value: 'sort:id:desc' },
                { name: 'Mas Viejos', value: 'sort:id:asc' }
            )),

    async execute(interaction, client) {
        // ✅ Defer subito con gestione errori
        try {
            await interaction.deferReply();
        } catch (error) {
            console.error('Defer failed (interaction expired):', error.message);
            // Se deferReply fallisce, l'interazione è già scaduta
            // Non possiamo fare nulla, usciamo
            return;
        }
        
        const pairing = interaction.options.getString('pairing');
        const sort = interaction.options.getString('sort');

        // Definisci i tags per ogni pairing
        const pairingTags = {
            'asushin': 'ikari_shinji asuka_langley_souryuu -nagisa_kaworu -rating:explicit -rating:questionable -futanari -yaoi -bisexual_male -2boys -multiple_boys -pegging -yuri -2girls -multiple_girls -bestiality',
            'asurei': 'ayanami_rei asuka_langley_souryuu -nagisa_kaworu -ikari_shinji -rating:explicit -rating:questionable -futanari -yaoi -bisexual_male -2boys -multiple_boys -pegging -yuri -2girls -bestiality',
            'kaworei': 'nagisa_kaworu ayanami_rei -ikari_shinji -asuka_langley_souryuu -rating:explicit -rating:questionable -futanari -yaoi -bisexual_male -2boys -multiple_boys -pegging -yuri -2girls -multiple_girls -bestiality',
            'mariken': 'makinami_mari_illustrious aida_kensuke -rating:explicit -rating:questionable -futanari -yaoi -bisexual_male -2boys -multiple_boys -pegging -yuri -2girls -multiple_girls -bestiality',
            'marishin': 'makinami_mari_illustrious ikari_shinji -nagisa_kaworu -rating:explicit -rating:questionable -futanari -yaoi -bisexual_male -2boys -multiple_boys -pegging -yuri -2girls -multiple_girls -bestiality',
            'nsfw_asuka': 'asuka_langley_souryuu 1girl solo -futanari -yaoi -bisexual_male -2boys -multiple_boys -pegging -yuri -2girls -multiple_girls -bestiality rating:explicit',
            'nsfw_mari': 'makinami_mari_illustrious 1girl solo -futanari -yaoi -bisexual_male -2boys -multiple_boys -pegging -yuri -2girls -multiple_girls -bestiality rating:explicit',
            'nsfw_misato': 'katsuragi_misato 1girl solo -futanari -yaoi -bisexual_male -2boys -multiple_boys -pegging -yuri -2girls -multiple_girls -bestiality rating:explicit',
            'nsfw_rei': 'ayanami_rei 1girl solo -futanari -yaoi -bisexual_male -2boys -multiple_boys -pegging -yuri -2girls -multiple_girls -bestiality rating:explicit'
        };

        const tags = `${pairingTags[pairing]} ${sort}`;

        // Controlla NSFW per comandi NSFW
        if (pairing.startsWith('nsfw_')) {
            if (!interaction.channel.nsfw && !(interaction.channel.parent && interaction.channel.parent.nsfw)) {
                await interaction.editReply('Este comando solo se puede usar en canales NSFW');
                return;
            }
        }

        // Cerca su Gelbooru
        const posts = await searchGelbooru(tags, 50);

        if (!posts || posts.length === 0) {
            await interaction.editReply('No se encontraron resultados para los tags proporcionados.');
            return;
        }

        let currentIndex = 0;

        const createEmbed = (index) => {
            return new EmbedBuilder()
                .setTitle(`${pairing.toUpperCase()}`)
                .setColor('Random')
                .setTimestamp(new Date(posts[index].created_at))
                .setDescription(`https://gelbooru.com/index.php?page=post&s=view&id=${posts[index].id}`)
                .setImage(posts[index].file_url)
                .setFooter({ text: `${index + 1}/${posts.length}` });
        };

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setEmoji('⬅️')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('next')
                .setEmoji('➡️')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('exit')
                .setEmoji('❌')
                .setStyle(ButtonStyle.Danger)
        );

        const response = await interaction.editReply({ 
            embeds: [createEmbed(0)], 
            components: [buttons] 
        });

        const collector = response.createMessageComponentCollector({ time: 300000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return await i.reply({ 
                    content: `Solo ${interaction.user.tag} Puede Usar Estos Botones`, 
                    flags: 64
                });
            }

            if (i.customId === 'next') {
                currentIndex = (currentIndex + 1) % posts.length;
                await i.update({ embeds: [createEmbed(currentIndex)] });
            } else if (i.customId === 'prev') {
                currentIndex = (currentIndex - 1 + posts.length) % posts.length;
                await i.update({ embeds: [createEmbed(currentIndex)] });
            } else if (i.customId === 'exit') {
                await i.message.delete();
            }
        });

        collector.on('end', () => {
            buttons.components.forEach(button => button.setDisabled(true));
            response.edit({ components: [buttons] }).catch(() => {});
        });
    },
};
