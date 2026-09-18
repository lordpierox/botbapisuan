const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { searchGelbooru } = require('../../utils/gelbooru');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gelbooru-evangelion')
        .setDescription('Busca imágenes de Evangelion en Gelbooru')
        .addStringOption(option => option
            .setName('tags')
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
                { name: 'Aleatorio', value: 'sort:random' },
                { name: 'Calificación', value: 'sort:score' },
                { name: 'Más Recientes', value: 'sort:id:desc' },
                { name: 'Más Antiguos', value: 'sort:id:asc' }
            )),

    async execute(interaction, client) {
        try {
            await interaction.deferReply();
        } catch (error) {
            console.error('Error al diferir la respuesta:', error.message);
            return;
        }

        const tags = interaction.options.getString('tags');
        const sort = interaction.options.getString('sort');

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

        const isNsfw = interaction.channel?.nsfw || (interaction.channel?.parent && interaction.channel.parent.nsfw);

        // Verificación de canales: los tags NSFW solo se permiten en canales NSFW
        if (tags && tags.startsWith('nsfw_')) {
            if (!isNsfw) {
                await interaction.editReply('❌ Este comando solo se puede usar en canales NSFW');
                return;
            }
        }

        const tagString = `${pairingTags[tags]} ${sort}`;

        // Búsqueda en Gelbooru mediante el proxy
        const posts = await searchGelbooru(tagString, 50);

        if (!posts || posts.length === 0) {
            await interaction.editReply('❌ No se encontraron imágenes para los tags seleccionados.');
            return;
        }

        let currentIndex = 0;

        const createEmbed = (index) => {
            const post = posts[index];
            // Priorità: sample_url (carica sempre veloce su Discord) o file_url
            const imageUrl = post.sample_url || post.file_url || post.preview_url;

            const embed = new EmbedBuilder()
                .setTitle(`${tags.toUpperCase()}`)
                .setColor('Random')
                .setTimestamp(new Date(post.created_at))
                .setDescription(`https://gelbooru.com/index.php?page=post&s=view&id=${post.id}`)
                .setFooter({ text: `Imagen ${index + 1} de ${posts.length}` });

            if (imageUrl) {
                embed.setImage(imageUrl);
            }

            return embed;
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
                    content: `⚠️ Solo ${interaction.user.tag} puede usar estos botones`,
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
                collector.stop();
                await i.message.delete().catch(() => {});
            }
        });

        collector.on('end', () => {
            buttons.components.forEach(button => button.setDisabled(true));
            response.edit({ components: [buttons] }).catch(() => {});
        });
    },
};