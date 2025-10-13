const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');

// Funzione helper per Gelbooru API
async function searchGelbooru(tags, limit = 50) {
    const url = 'https://gelbooru.com/index.php';
    const params = {
        page: 'dapi',
        s: 'post',
        q: 'index',
        json: 1,
        tags: tags,
        limit: limit
    };
    
    try {
        const response = await axios.get(url, { params, timeout: 10000 });
        return response.data.post || [];
    } catch (error) {
        console.error('Gelbooru API Error:', error.message);
        return [];
    }
}

// Classe per gestire i risultati
class ImageResult {
    constructor(id, date, link) {
        this.id = id;
        this.date = date;
        this.link = link;
    }
}

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
                { name: 'Explicit', value: 'rating:explicit' },
            ))
        .addStringOption(option => option
            .setName('sort')
            .setDescription('Ordinamento')
            .setRequired(true)
            .addChoices(
                { name: 'Random', value: 'sort:random' },
                { name: 'Score', value: 'sort:score' },
                { name: 'Più recenti', value: 'sort:id:desc' },
                { name: 'Più vecchi', value: 'sort:id:asc' },
            )),

    async execute(interaction, client) {
        await interaction.deferReply();

        let tags = interaction.options.getString('tags');
        let rating = interaction.options.getString('rating');
        let sort = interaction.options.getString('sort');

        // Applica tutte le sostituzioni tags (Evangelion specifici)
        tags = ` ${tags} ${sort}`;
        
        // Sostituzioni caratteri Evangelion (mantieni le tue)
        tags = tags.replace(/ mpe/gi, ' mass_production_eva ');
        tags = tags.replace(/ shinji/gi, ' ikari_shinji ');
        tags = tags.replace(/ rei/gi, ' ayanami_rei ');
        tags = tags.replace(/ asuka/gi, ' asuka_langley_souryuu ');
        tags = tags.replace(/ kaworu/gi, ' nagisa_kaworu ');
        tags = tags.replace(/ misato/gi, ' katsuragi_misato ');
        // ... (aggiungi tutte le altre sostituzioni che hai nel file originale)

        // Controlla NSFW
        let parentChannel;
        const isNsfw = interaction.channel.nsfw || 
                      (interaction.channel.parent && client.channels.cache.get(interaction.channel.parentId)?.nsfw);

        if (!isNsfw) {
            if (rating === '-rating:general -rating:sensitive' || 
                rating === 'rating:questionable' || 
                rating === 'rating:explicit') {
                await interaction.editReply({ content: 'Questo comando può essere usato solo in canali NSFW' });
                return;
            }
            
            // Aggiungi filtri SFW
            tags += ' -penis -completely_nude -sex -futanari';
        }

        tags += ` ${rating}`;

        // Cerca su Gelbooru
        const posts = await searchGelbooru(tags, 50);

        if (!posts || posts.length === 0) {
            await interaction.editReply('Nessuna immagine trovata con questi tags');
            return;
        }

        // Crea lista risultati
        const results = posts.map(post => new ImageResult(
            post.id,
            new Date(post.created_at),
            post.file_url
        ));

        // Crea bottoni navigazione
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
                .setStyle(ButtonStyle.Danger),
        );

        let currentIndex = 0;
        const maxIndex = results.length - 1;

        // Crea embed iniziale
        const createEmbed = (index) => {
            return new EmbedBuilder()
                .setTitle('SEARCH')
                .setColor('Random')
                .setTimestamp(results[index].date)
                .setDescription(`https://gelbooru.com/index.php?page=post&s=view&id=${results[index].id}`)
                .setImage(results[index].link)
                .setFooter({ text: `${index + 1}/${maxIndex + 1}` });
        };

        const response = await interaction.editReply({ 
            embeds: [createEmbed(0)], 
            components: [buttons] 
        });

        // Collector per i bottoni
        const collector = response.createMessageComponentCollector({ time: 300000 }); // 5 minuti

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return await i.reply({ 
                    content: `Solo ${interaction.user.tag} può usare questi bottoni`, 
                    ephemeral: true 
                });
            }

            if (i.customId === 'next') {
                currentIndex++;
                if (currentIndex > maxIndex) currentIndex = 0;
                await i.update({ embeds: [createEmbed(currentIndex)], components: [buttons] });
            } else if (i.customId === 'prev') {
                currentIndex--;
                if (currentIndex < 0) currentIndex = maxIndex;
                await i.update({ embeds: [createEmbed(currentIndex)], components: [buttons] });
            } else if (i.customId === 'exit') {
                await i.message.delete();
            }
        });

        collector.on('end', () => {
            // Disabilita i bottoni dopo 5 minuti
            buttons.components.forEach(button => button.setDisabled(true));
            response.edit({ components: [buttons] }).catch(() => {});
        });
    },
};
