const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const { searchGelbooru } = require('../../utils/gelbooru');

// Descarga la imagen en memoria con el Referer adecuado
async function fetchImageAttachment(url) {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Referer': 'https://gelbooru.com/'
            },
            timeout: 10000
        });

        const extension = url.split('.').pop().split('?')[0] || 'jpg';
        const fileName = `gelbooru_image.${extension}`;
        return new AttachmentBuilder(Buffer.from(response.data), { name: fileName });
    } catch (error) {
        console.error('Error al descargar la imagen:', error.message);
        return null;
    }
}

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
            console.error('Error al diferir:', error.message);
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

        if (tags && tags.startsWith('nsfw_') && !isNsfw) {
            await interaction.editReply('❌ Este comando solo se puede usar en canales NSFW');
            return;
        }

        const tagString = `${pairingTags[tags]} ${sort}`;
        const posts = await searchGelbooru(tagString, 50);

        if (!posts || posts.length === 0) {
            await interaction.editReply('❌ No se encontraron imágenes.');
            return;
        }

        let currentIndex = 0;

        const buildMessagePayload = async (index) => {
            const post = posts[index];
            const rawUrl = post.sample_url || post.file_url || post.preview_url;
            const attachment = await fetchImageAttachment(rawUrl);

            const embed = new EmbedBuilder()
                .setTitle(`${tags.toUpperCase()}`)
                .setColor('Random')
                .setTimestamp(post.created_at ? new Date(post.created_at) : new Date())
                .setDescription(`[Ver en Gelbooru](https://gelbooru.com/index.php?page=post&s=view&id=${post.id})`)
                .setFooter({ text: `Imagen ${index + 1} de ${posts.length}` });

            if (attachment) {
                embed.setImage(`attachment://${attachment.name}`);
                return { embeds: [embed], files: [attachment] };
            } else if (rawUrl) {
                embed.setImage(rawUrl);
                return { embeds: [embed], files: [] };
            }
            return { embeds: [embed], files: [] };
        };

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('prev').setEmoji('⬅️').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('next').setEmoji('➡️').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('exit').setEmoji('❌').setStyle(ButtonStyle.Danger)
        );

        const initialPayload = await buildMessagePayload(0);
        initialPayload.components = [buttons];

        const response = await interaction.editReply(initialPayload);
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
                const payload = await buildMessagePayload(currentIndex);
                payload.components = [buttons];
                await i.update(payload);
            } else if (i.customId === 'prev') {
                currentIndex = (currentIndex - 1 + posts.length) % posts.length;
                const payload = await buildMessagePayload(currentIndex);
                payload.components = [buttons];
                await i.update(payload);
            } else if (i.customId === 'exit') {
                collector.stop();
                await i.message.delete().catch(() => {});
            }
        });

        collector.on('end', () => {
            buttons.components.forEach(button => button.setDisabled(true));
            response.edit({ components: [buttons] }).catch(() => {});
        });
    }
};