const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { searchGelbooru } = require('../../utils/gelbooru');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Busca imágenes en Gelbooru')
        .addStringOption(option =>
            option.setName('tags')
                .setDescription('Tags (es: asuka shinji -kaworu hug happy)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('rating')
                .setDescription('Rating de la imagen')
                .setRequired(true)
                .addChoices(
                    { name: 'SFW (general y sensitive)', value: '-rating:explicit -rating:questionable' },
                    { name: 'NSFW (questionable y explicit)', value: '-rating:general -rating:sensitive' },
                    { name: 'General', value: 'rating:general' },
                    { name: 'Sensitive', value: 'rating:sensitive' },
                    { name: 'Questionable', value: 'rating:questionable' },
                    { name: 'Explicit', value: 'rating:explicit' }
                ))
        .addStringOption(option =>
            option.setName('sort')
                .setDescription('Ordinamento')
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
            console.error('Defer failed:', error.message);
            return;
        }

        let tags = interaction.options.getString('tags');
        const rating = interaction.options.getString('rating');
        const sort = interaction.options.getString('sort');

        // Sostituzioni tag Evangelion
        tags = ` ${tags} ${sort} `;
        tags = tags.replace(/ mpe/gi, ' mass_production_eva ')
                   .replace(/ shinji/gi, ' ikari_shinji ')
                   .replace(/ rei/gi, ' ayanami_rei ')
                   .replace(/ asuka/gi, ' asuka_langley_souryuu ')
                   .replace(/ kaworu/gi, ' nagisa_kaworu ')
                   .replace(/ misato/gi, ' katsuragi_misato ')
                   .replace(/ mari/gi, ' makinami_mari_illustrious ')
                   .replace(/ gendo/gi, ' ikari_gendo ')
                   .replace(/ yui/gi, ' ikari_yui ')
                   .replace(/ ritsuko/gi, ' akagi_ritsuko ')
                   .replace(/ maya/gi, ' ibuki_maya ')
                   .replace(/ kaji/gi, ' kaji_ryouji ')
                   .replace(/ kensuke/gi, ' aida_kensuke ')
                   .replace(/ toji/gi, ' suzuhara_touji ')
                   .replace(/ hikari/gi, ' horaki_hikari ')
                   .replace(/ pen2|pen-pen|penpen/gi, ' pen_pen ');

        const isNsfw = interaction.channel?.nsfw || (interaction.channel?.parent && interaction.channel.parent.nsfw);

        if (!isNsfw) {
            if (rating === '-rating:general -rating:sensitive' ||
                rating === 'rating:questionable' ||
                rating === 'rating:explicit') {
                return await interaction.editReply('Este comando solo se puede usar en canales NSFW.');
            }
            tags += ' -penis -completely_nude -sex -futanari -breasts -nipples -nude';
        }

        tags += ` ${rating}`;

        const posts = await searchGelbooru(tags, 50);

        if (!posts || posts.length === 0) {
            return await interaction.editReply('No se encontraron imágenes.');
        }

        let currentIndex = 0;

        const createEmbed = (index) => {
            const post = posts[index];
            return new EmbedBuilder()
                .setTitle('GELBOORU SEARCH')
                .setColor(0x0099FF)
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
            buttons.components.forEach(button => button.setDisabled(true));
            response.edit({ components: [buttons] }).catch(() => {});
        });
    }
};