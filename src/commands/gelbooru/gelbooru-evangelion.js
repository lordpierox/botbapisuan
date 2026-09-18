const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { searchGelbooru } = require('../../utils/gelbooru');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gelbooru-evangelion')
        .setDescription('Busca imágenes de Evangelion en Gelbooru')
        .addStringOption(option =>
            option.setName('personaje')
                .setDescription('Personaje específico')
                .setRequired(false)
                .addChoices(
                    { name: 'Asuka Langley', value: 'asuka_langley_souryuu' },
                    { name: 'Rei Ayanami', value: 'ayanami_rei' },
                    { name: 'Shinji Ikari', value: 'ikari_shinji' },
                    { name: 'Kaworu Nagisa', value: 'nagisa_kaworu' },
                    { name: 'Misato Katsuragi', value: 'katsuragi_misato' },
                    { name: 'Mari Makinami', value: 'makinami_mari_illustrious' }
                ))
        .addStringOption(option =>
            option.setName('rating')
                .setDescription('Filtro de contenido')
                .setRequired(false)
                .addChoices(
                    { name: 'SFW', value: '-rating:explicit -rating:questionable' },
                    { name: 'NSFW', value: '-rating:general -rating:sensitive' },
                    { name: 'Solo Explicit', value: 'rating:explicit' }
                )),

    async execute(interaction, client) {
        try {
            await interaction.deferReply();
        } catch (error) {
            console.error('Defer failed:', error.message);
            return;
        }

        const character = interaction.options.getString('personaje') || '';
        const rating = interaction.options.getString('rating') || '-rating:explicit -rating:questionable';

        const isNsfw = interaction.channel?.nsfw || (interaction.channel?.parent && interaction.channel.parent.nsfw);

        if (!isNsfw && (rating.includes('explicit') || rating.includes('questionable'))) {
            return await interaction.editReply('Las opciones NSFW solo pueden usarse en canales NSFW.');
        }

        const queryTags = `neon_genesis_evangelion ${character} sort:random ${rating}`;
        const posts = await searchGelbooru(queryTags, 40);

        if (!posts || posts.length === 0) {
            return await interaction.editReply('No se encontraron imágenes.');
        }

        let currentIndex = 0;

        const createEmbed = (index) => {
            const post = posts[index];
            return new EmbedBuilder()
                .setTitle('EVANGELION GELBOORU')
                .setColor(0x8A2BE2)
                .setTimestamp(post.created_at ? new Date(post.created_at) : new Date())
                .setDescription(`[Ver en Gelbooru](https://gelbooru.com/index.php?page=post&s=view&id=${post.id})`)
                .setImage(post.file_url)
                .setFooter({ text: `${index + 1}/${posts.length}` });
        };

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('prev').setEmoji('⬅️').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('next').setEmoji('➡️').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('exit').setEmoji('❌').setStyle(ButtonStyle.Danger)
        );

        const response = await interaction.editReply({
            embeds: [createEmbed(0)],
            components: [buttons]
        });

        const collector = response.createMessageComponentCollector({ time: 300000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return await i.reply({
                    content: `Solo <@${interaction.user.id}> puede usar estos botones.`,
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
            buttons.components.forEach(btn => btn.setDisabled(true));
            response.edit({ components: [buttons] }).catch(() => {});
        });
    }
};