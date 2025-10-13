const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { searchGelbooru } = require('../../utils/gelbooru');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Cerca immagini su Gelbooru')
        .addStringOption(option => option
            .setName('tags')
            .setDescription('Tags (es: asuka shinji -kaworu hug happy)')
            .setRequired(true))
        .addStringOption(option => option
            .setName('rating')
            .setDescription('Rating')
            .setRequired(true)
            .addChoices(
                { name: 'SFW (general e sensitive)', value: '-rating:explicit -rating:questionable' },
                { name: 'NSFW (questionable e explicit)', value: '-rating:general -rating:sensitive' },
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
                { name: 'Random', value: 'sort:random' },
                { name: 'Score', value: 'sort:score' },
                { name: 'Più recenti', value: 'sort:id:desc' },
                { name: 'Più vecchi', value: 'sort:id:asc' }
            )),

    async execute(interaction, client) {
        // ✅ Defer subito con gestione errori
        try {
            await interaction.deferReply();
        } catch (error) {
            console.error('Defer failed (interaction expired):', error.message);
            // Se deferReply fallisce, l'interazione è già scaduta
            return;
        }

        let tags = interaction.options.getString('tags');
        const rating = interaction.options.getString('rating');
        const sort = interaction.options.getString('sort');

        // Sostituzioni caratteri Evangelion
        tags = ` ${tags} ${sort}`;
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

        // Controlla NSFW
        const isNsfw = interaction.channel.nsfw || 
                      (interaction.channel.parent && interaction.channel.parent.nsfw);

        if (!isNsfw) {
            if (rating === '-rating:general -rating:sensitive' || 
                rating === 'rating:questionable' || 
                rating === 'rating:explicit') {
                await interaction.editReply('Questo comando può essere usato solo in canali NSFW');
                return;
            }
            tags += ' -penis -completely_nude -sex -futanari -breasts -nipples -nude';
        }

        tags += ` ${rating}`;

        // Cerca su Gelbooru
        const posts = await searchGelbooru(tags, 50);

        if (!posts || posts.length === 0) {
            await interaction.editReply('Nessuna immagine trovata con questi tags');
            return;
        }

        let currentIndex = 0;

        const createEmbed = (index) => {
            return new EmbedBuilder()
                .setTitle('SEARCH')
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
                    content: `Solo ${interaction.user.tag} può usare questi bottoni`, 
                    flags: 64 // ephemeral
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
