const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    AttachmentBuilder 
} = require('discord.js');
const axios = require('axios');
const { resolveSearchQuery } = require('../utils/tagManager');

// Descarga la imagen en memoria con el Referer adecuado para evitar bloqueos CDN de Discord
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
        console.error('[Image Fetch] Error al descargar la imagen:', error.message);
        return null;
    }
}

// Respaldo 1: Consulta a Groq (Modelo activo llama-3.3-70b-versatile con fallback de modelos)
async function askGroqForDanbooruTag(query) {
    const candidateModels = ['llama-3.3-70b-versatile', 'llama3-70b-8192', 'llama3-8b-8192'];

    for (const model of candidateModels) {
        try {
            console.log(`[Groq AI Fallback] Consultando modelo '${model}' para: "${query}"`);
            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: model,
                    messages: [
                        {
                            role: 'system',
                            content: `Eres un conversor de texto a etiquetas (tags) oficiales de Danbooru y Gelbooru.
Tu único trabajo es devolver los tags canónicos exactos separados por espacios.

REGLAS:
1. Personajes: usa formato oficial con guiones bajos (ej: "misato" -> katsuragi_misato, "asuka" -> asuka_langley_souryuu, "shinji" -> ikari_shinji, "chisa" -> kotegawa_chisa, "yani neko" -> satou_yaniko).
2. Si conoces la franquicia asociada, añádela (ej: neon_genesis_evangelion, grand_blue).
3. Responde ÚNICAMENTE con los tags en minúsculas. Cero explicaciones, cero comillas, cero texto adicional.`
                        },
                        {
                            role: 'user',
                            content: query
                        }
                    ],
                    max_tokens: 35,
                    temperature: 0.1
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 7000
                }
            );

            let aiTags = response.data?.choices?.[0]?.message?.content?.trim().toLowerCase();
            aiTags = aiTags ? aiTags.replace(/[`"'\n\r]/g, '').trim() : null;

            if (aiTags) {
                console.log(`[Groq AI Fallback] Tags obtenidos con éxito (${model}): "${aiTags}"`);
                return aiTags;
            }
        } catch (error) {
            console.warn(`[Groq AI Fallback] Modelo '${model}' falló:`, error.response?.data?.error?.message || error.message);
        }
    }
    return null;
}

// Respaldo 2: Consulta gratuita a la API de Danbooru si Groq falla
async function fetchDanbooruTagDirectly(term) {
    try {
        const cleanTerm = term.trim().split(/\s+/)[0];
        console.log(`[Danbooru Tag Fallback] Buscando tag de personaje oficial para: "${cleanTerm}"`);
        const url = `https://danbooru.donmai.us/tags.json?search[name_matches]=*${encodeURIComponent(cleanTerm)}*&search[category]=4&search[order]=count&limit=1`;
        
        const res = await axios.get(url, {
            headers: { 'User-Agent': 'DiscordBotTagResolver/2.0' },
            timeout: 5000
        });

        if (res.data && res.data.length > 0) {
            const canonicalTag = res.data[0].name;
            console.log(`[Danbooru Tag Fallback] Tag oficial encontrado en Danbooru: "${canonicalTag}"`);
            return canonicalTag;
        }
    } catch (error) {
        console.error('[Danbooru Tag Fallback] Error al consultar Danbooru API:', error.message);
    }
    return null;
}

// Consulta centralizada a través de tu proxy Gelbooru
async function queryGelbooruProxy(tags) {
    const proxyUrl = 'https://gelproxy.deraktsu.com/index.php';
    const params = new URLSearchParams({
        page: 'dapi',
        s: 'post',
        q: 'index',
        tags: tags,
        json: '1',
        limit: '25',
        user_id: '2055792',
        api_key: '492c6a96bc04c723915e7ae476716a7b88f6f52f8d38ebce0104c655e5d4faf0a82e1fcd0c145d268190eb1e4e88024256980b7f0d4ff81fc780242f4b200c92'
    });

    const response = await axios.get(`${proxyUrl}?${params.toString()}`, {
        headers: { 'x-proxy-token': 'Ugotto1821' },
        timeout: 10000
    });

    return response.data?.post || [];
}

module.exports = {
    name: 'messageCreate',
    on: true,
    async execute(message, client) {
        try {
            if (message.author.bot) return;

            // ============================================
            // DETECTAR MENCIÓN O RESPUESTA AL BOT
            // ============================================
            const botMentioned = message.mentions.has(client.user);
            const isReplyToBot = message.reference && 
                message.channel.messages.cache.get(message.reference.messageId)?.author.id === client.user.id;

            if (botMentioned || isReplyToBot) {
                const textLower = message.content.toLowerCase();
                const searchTriggers = ['busca', 'manda', 'envia', 'mandame', 'enviame', 'buscame'];
                const isSearchCommand = searchTriggers.some(trigger => textLower.includes(trigger));

                if (isSearchCommand) {
                    await message.channel.sendTyping();
                    console.log(`[Command] Búsqueda solicitada por ${message.author.tag}: "${message.content}"`);

                    try {
                        const isNsfwChannel = message.channel.nsfw || (message.channel.parent && message.channel.parent.nsfw) || false;
                        const requestedNsfw = /\b(porno|xxx|rule|rule34|r34|hentai|nopor|ecchi|nsfw)\b/i.test(message.content);

                        if (!isNsfwChannel && requestedNsfw) {
                            console.log(`[Seguridad] Bloqueada petición NSFW en canal SFW: #${message.channel.name}`);
                            return message.reply('❌ Este tipo de imágenes solo se pueden pedir en canales marcados como NSFW dx.');
                        }

                        // Limpiar invocación
                        let cleanQuery = message.content
                            .replace(/<@!?\d+>/g, '')
                            .replace(/\b(manda|envia|busca|mandame|enviame|buscame)\b/gi, '')
                            .replace(/\b(imagen|imagenes|foto|fotos|dibujo|dibujos|de|del|un|una|algo)\b/gi, '')
                            .replace(/\b(porno|xxx|rule|rule34|r34|hentai|nopor|ecchi|nsfw)\b/gi, '')
                            .trim();

                        console.log(`[TagManager] Query limpia a procesar: "${cleanQuery}"`);

                        // 1. Intentar resolver localmente con el CSV
                        let tagsToSearch = resolveSearchQuery(cleanQuery);
                        console.log(`[TagManager] Tags obtenidos del CSV: "${tagsToSearch}"`);

                        const isUnresolvedLocally = !tagsToSearch || tagsToSearch.trim().toLowerCase() === cleanQuery.toLowerCase();

                        // 2. Si no se reconoció en el CSV, recurrir a Groq y luego a Danbooru
                        if (isUnresolvedLocally) {
                            console.log(`[TagManager] No se reconoció en CSV local. Activando respaldo...`);
                            let resolvedTag = await askGroqForDanbooruTag(cleanQuery);

                            if (!resolvedTag) {
                                console.log('[TagManager] Groq no disponible. Consultando API de Danbooru...');
                                resolvedTag = await fetchDanbooruTagDirectly(cleanQuery);
                            }

                            if (resolvedTag) {
                                tagsToSearch = resolvedTag;
                            }
                        }

                        // Filtro según canal y solicitud
                        let ratingFilter = '';
                        if (!isNsfwChannel) {
                            ratingFilter = 'rating:general -penis -completely_nude -sex -futanari -breasts -nipples -nude';
                        } else if (requestedNsfw) {
                            ratingFilter = 'rating:explicit';
                        }

                        let finalTags = `${tagsToSearch} ${ratingFilter} sort:random`.trim();
                        console.log(`[Gelbooru Proxy] Consultando posts con tags: "${finalTags}"`);

                        let posts = await queryGelbooruProxy(finalTags);

                        // Si falló Gelbooru con los tags actuales, reintentar con búsqueda de Danbooru API
                        if (!posts || posts.length === 0) {
                            console.log('[Gelbooru Proxy] 0 resultados. Probando búsqueda directa en Danbooru...');
                            const directTag = await fetchDanbooruTagDirectly(cleanQuery);
                            if (directTag && directTag !== tagsToSearch) {
                                finalTags = `${directTag} ${ratingFilter} sort:random`.trim();
                                console.log(`[Gelbooru Proxy] Reintentando con: "${finalTags}"`);
                                posts = await queryGelbooruProxy(finalTags);
                            }
                        }

                        if (!posts || posts.length === 0) {
                            console.log('[Gelbooru Proxy] No se encontraron posts en Gelbooru.');
                            return message.reply('❌ No encontré ninguna imagen con esos tags dx.');
                        }

                        console.log(`[Gelbooru Proxy] Se encontraron ${posts.length} posts. Construyendo galería...`);
                        let currentIndex = 0;

                        // Construcción de carga útil para Discord
                        const buildMessagePayload = async (index) => {
                            const post = posts[index];
                            const rawUrl = post.file_url || post.sample_url || post.preview_url;
                            const attachment = await fetchImageAttachment(rawUrl);

                            const embed = new EmbedBuilder()
                                .setTitle('SEARCH')
                                .setColor('Random')
                                .setTimestamp(post.created_at ? new Date(post.created_at) : new Date())
                                .setDescription(`[Ver en Gelbooru](https://gelbooru.com/index.php?page=post&s=view&id=${post.id})`)
                                .setFooter({ text: `${index + 1}/${posts.length}` });

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

                        const replyMessage = await message.reply(initialPayload);
                        const collector = replyMessage.createMessageComponentCollector({ time: 300000 });

                        collector.on('collect', async i => {
                            if (i.user.id !== message.author.id) {
                                return await i.reply({ 
                                    content: `⚠️ Solo ${message.author.username} puede controlar esta búsqueda.`, 
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
                                await replyMessage.delete().catch(() => {});
                            }
                        });

                        collector.on('end', () => {
                            buttons.components.forEach(button => button.setDisabled(true));
                            replyMessage.edit({ components: [buttons] }).catch(() => {});
                        });

                    } catch (error) {
                        console.error('[Error General] Error en búsqueda de Gelbooru:', error);
                        return message.reply('Hubo un error al procesar la búsqueda dx.');
                    }
                }
            }

            // ============================================
            // LÓGICA BUMP
            // ============================================
            if (message.type == 20 && message.channel.id == "1032780435425603614" && message.interaction?.commandName == "bump") {
                console.log("[Bump] Bump detectado");
                var member;
                const guild = message.guild;
                
                await guild.members.cache.forEach(m => {
                    m.roles.remove("1075621882591715419").catch(() => {});
                });
                
                member = await guild.members.cache.get(message.interaction.user.id);
                const channel = message.channel;
                
                if (!member) {
                    await channel.send("Lilim no encontrado dx.");
                } else {
                    setTimeout(() => member.roles.add("1075621882591715419"), 8000);
                    setTimeout(() => member.roles.remove("1075621882591715419"), 7200000);
                }
            }

            // ============================================
            // SISTEMA DE TELÉFONO - Relay de Mensajes GRUPALES
            // ============================================
            const guildId = message.guild?.id;
            if (guildId && global.phoneSystem && global.phoneSystem.guildRooms.has(guildId)) {
                const roomId = global.phoneSystem.guildRooms.get(guildId);
                const room = global.phoneSystem.activeRooms.get(roomId);

                if (!room) return;

                const userId = message.author.id;
                if (!room.users.has(userId)) {
                    const { getRandomAvatar } = require('../commands/Community/telefono');
                    room.users.set(userId, {
                        avatar: getRandomAvatar(),
                        nickname: message.member?.displayName || message.author.username
                    });
                }

                const userData = room.users.get(userId);
                const { censorNick, censorServer, getAvatarAttachment } = require('../commands/Community/telefono');
                const censoredNick = censorNick(userData.nickname);
                const censoredServer = censorServer(message.guild.name);

                try {
                    const messageEmbed = new EmbedBuilder()
                        .setAuthor({ 
                            name: `${censoredNick} desde ${censoredServer}`, 
                            iconURL: userData.avatar
                        })
                        .setDescription(message.content || '*[mensaje vacío]*')
                        .setColor('Blue')
                        .setTimestamp()
                        .setThumbnail(userData.avatar);

                    if (message.attachments.size > 0) {
                        const attachment = message.attachments.first();
                        if (attachment.contentType?.startsWith('image/')) {
                            messageEmbed.setImage(attachment.url);
                        }
                    }

                    const avatarAttachment = getAvatarAttachment(userData.avatar);
                    const messageOptions = { embeds: [messageEmbed] };
                    
                    if (avatarAttachment) {
                        messageOptions.files = [avatarAttachment];
                    }

                    for (const channelId of room.channels) {
                        if (channelId === message.channel.id) continue;

                        try {
                            const channel = await client.channels.fetch(channelId);
                            await channel.send(messageOptions);
                        } catch (error) {
                            console.error(`[Phone] Error enviando a canal ${channelId}:`, error);
                        }
                    }

                    room.lastActivity = Date.now();
                    const { startInactivityTimer } = require('../commands/Community/telefono');
                    startInactivityTimer(roomId, client);

                } catch (error) {
                    console.error('[Phone] Error en sistema telefónico:', error);
                }
            }

        } catch (error) {
            console.log('[Error] En messageCreate:', error);
        }
    },
};