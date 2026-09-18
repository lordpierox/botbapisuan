const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { searchGelbooru } = require('../../utils/gelbooru');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Busca imágenes en Gelbooru')
        .addStringOption(option => option
            .setName('tags')
            .setDescription('Tags (ej: asuka shinji -kaworu hug happy)')
            .setRequired(true))
        .addStringOption(option => option
            .setName('rating')
            .setDescription('Rating')
            .setRequired(true)
            .addChoices(
                { name: 'SFW (general y sensitive)', value: '-rating:explicit -rating:questionable' },
                { name: 'NSFW (questionable y explicit)', value: '-rating:general -rating:sensitive' },
                { name: 'General', value: 'rating:general' },
                { name: 'Sensitive', value: 'rating:sensitive' },
                { name: 'Questionable', value: 'rating:questionable' },
                { name: 'Explicit', value: 'rating:explicit' }
            ))
        .addStringOption(option => option
            .setName('sort')
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
            console.error('Error al diferir la respuesta (interacción expirada):', error.message);
            return;
        }

        let tags = interaction.options.getString('tags');
        const rating = interaction.options.getString('rating');
        const sort = interaction.options.getString('sort');

        // Normalización de nombres de personajes de Evangelion
        tags = ` ${tags} ${sort} `;
        tags = tags.replace(/ mpe/gi, ' mass_production_eva ');
        tags = tags.replace(/ shinji/gi, ' ikari_shinji ');
        tags = tags.replace(/ rei/gi, ' ayanami_rei ');
        tags = tags.replace(/ asuka/gi, ' asuka_langley_souryuu ');
        tags = tags.replace(/ kaworu/gi, ' nagisa_kaworu ');
        tags = tags.replace(/ misato/gi, ' katsuragi_misato ');
        tags = tags.replace(/ mari/gi, ' makinami_mari_illustrious ');
        tags = tags.replace(/ gendo/gi, ' ikari_gendo ');
        tags = tags.replace(/ yui/gi, ' ikari_yui ');
        tags = tags.replace(/ ritsuko/gi, ' akagi_ritsuko ');
        tags = tags.replace(/ maya/gi, ' ibuki_maya ');
        tags = tags.replace(/ kaji/gi, ' kaji_ryouji ');
        tags = tags.replace(/ kensuke/gi, ' aida_kensuke ');
        tags = tags.replace(/ toji/gi, ' suzuhara_touji ');
        tags = tags.replace(/ hikari/gi, ' horaki_hikari ');
        tags = tags.replace(/ pen2/gi, ' pen_pen ');
        tags = tags.replace(/ pen-pen/gi, ' pen_pen ');
        tags = tags.replace(/ penpen/gi, ' pen_pen ');

        // Verificación de canal NSFW
        const isNsfw = interaction.channel?.nsfw || 
                      (interaction.channel?.parent && interaction.channel.parent.nsfw);

        // SFW, General y Sensitive están permitidos en canales normales; Questionable, Explicit y NSFW requieren canal NSFW
        if (!isNsfw) {
            if (rating === '-rating:general -rating:sensitive' || 
                rating === 'rating:questionable' || 
                rating === 'rating:explicit') {
                await interaction.editReply('❌ Este comando solo se puede usar en canales NSFW');
                return;
            }
            // En canales regulares se eliminan tags explícitos
            tags += ' -penis -completely_nude -sex -futanari -breasts -nipples -nude';
        }

        tags += ` ${rating}`;

        // Búsqueda en Gelbooru a través del proxy
        const posts = await searchGelbooru(tags, 50);

        if (!posts || posts.length === 0) {
            await interaction.editReply('❌ No se encontraron imágenes.');
            return;
        }

        let currentIndex = 0;

        const createEmbed = (index) => {
            const post = posts[index];
            
            // Reconstruye la URL directa evitando los bloqueos de hotlink de Discord
            let imageUrl = post.file_url;
            if (post.directory && post.image) {
                imageUrl = `https://gelbooru.com//images/${post.directory}/${post.image}`;
            }

            const embed = new EmbedBuilder()
                .setTitle(tags ? tags.toUpperCase() : 'SEARCH')
                .setColor('Random')
                .setTimestamp(post.created_at ? new Date(post.created_at) : new Date())
                .setDescription(`[Ver en Gelbooru](https://gelbooru.com/index.php?page=post&s=view&id=${post.id})`)
                .setImage(imageUrl)
                .setFooter({ text: `Imagen ${index + 1} de ${posts.length}` });

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