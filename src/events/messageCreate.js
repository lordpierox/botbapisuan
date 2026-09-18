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

// Diccionario de rescate inmediato para personajes clave mientras completas los CSVs
const QUICK_FALLBACKS = {
    'asuka': 'asuka_langley_souryuu neon_genesis_evangelion',
    'misato': 'katsuragi_misato neon_genesis_evangelion',
    'rei': 'ayanami_rei neon_genesis_evangelion',
    'shinji': 'ikari_shinji neon_genesis_evangelion',
    'kaworu': 'nagisa_kaworu neon_genesis_evangelion',
    'mari': 'makinami_mari_illustrious neon_genesis_evangelion',
    'yani neko': 'satou_yaniko',
    'yaniko': 'satou_yaniko',
    'chisa': 'kotegawa_chisa grand_blue'
};

let cachedGroqModel = null;

// Obtiene dinámicamente el modelo activo permitido en tu cuenta de Groq
async function getActiveGroqModel() {
    if (cachedGroqModel) return cachedGroqModel;

    try {
        const res = await axios.get('https://api.groq.com/openai/v1/models', {
            headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
            timeout: 5000
        });

        const models = res.data?.data
            ?.filter(m => m.active !== false && !m.id.includes('whisper') && !m.id.includes('guard'))
            ?.map(m => m.id) || [];

        console.log('[Groq] Modelos activos en tu cuenta:', models);

        const selected = models.find(m => m.includes('llama-3.3') || m.includes('llama-3.1'))
            || models.find(m => m.includes('gemma') || m.includes('mixtral') || m.includes('qwen'))
            || models[0];

        if (selected) {
            cachedGroqModel = selected;
            console.log(`[Groq] Modelo seleccionado automáticamente: "${cachedGroqModel}"`);
            return cachedGroqModel;
        }
    } catch (error) {
        console.error('[Groq] No se pudo autodetectar el modelo:', error.response?.data?.error?.message || error.message);
    }
    return 'llama-3.3-70b-versatile';
}

// Descarga la imagen en memoria con el Referer adecuado
async function fetchImageAttachment(url) {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Referer': 'https://gelbooru.com/'
            },
            timeout: 15000
        });

        const extension = url.split('.').pop().split('?')[0] || 'jpg';
        const fileName = `gelbooru_image.${extension}`;
        return new AttachmentBuilder(Buffer.from(response.data), { name: fileName });
    } catch (error) {
        console.error('[Image Fetch] Error al descargar la imagen:', error.message);
        return null;
    }
}

// Respaldo con IA (Groq) usando el modelo autodetectado de tu cuenta
async function askGroqForDanbooruTag(query) {
    const model = await getActiveGroqModel();
    if (!model) return null;

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
1. Personajes: usa formato oficial con guiones bajos (ej: "misato" -> katsuragi_misato, "asuka" -> asuka_langley_souryuu, "chisa" -> kotegawa_chisa, "yani neko" -> satou_yaniko).
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
        console.log(`[Groq AI Fallback] Tags generados por IA: "${aiTags}"`);
        return aiTags;
    } catch (error) {
        console.error('[Groq AI Fallback] Error al consultar Groq:', error.response?.data?.error?.message || error.message);
        return null;
    }
}

// Respaldo mediante la API de tags de Gelbooru a través de tu proxy privado (evita error 403)
async function fetchTagFromProxy(term) {
    try {
        const cleanTerm = term.trim().split(/\s+/)[0];
        console.log(`[Proxy Tag Fallback] Buscando tag oficial en Gelbooru para: "${cleanTerm}"`);
        const proxyUrl = 'https://gelproxy.deraktsu.com/index.php';
        const params = new URLSearchParams({
            page: 'dapi',
            s: 'tag',
            q: 'index',
            name: cleanTerm,
            json: '1'
        });

        const res = await axios.get(`${proxyUrl}?${params.toString()}`, {
            headers: { 'x-proxy-token': 'Ugotto1821' },
            timeout: 6000
        });

        const tagList = res.data?.tag;
        if (tagList && tagList.length > 0) {
            const canonicalTag = tagList[0].name;
            console.log(`[Proxy Tag Fallback] Tag encontrado: "${canonicalTag}"`);
            return canonicalTag;
        }
    } catch (error) {
        console.error('[Proxy Tag Fallback] Error buscando tag en proxy:', error.message);
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

                        // Limpiar texto de invocación
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

                        // 2. Si no se reconoció en el CSV, pasar por: Diccionario Rápido -> Groq -> Proxy Tag
                        if (isUnresolvedLocally) {
                            const lookupKey = cleanQuery.toLowerCase();
                            if (QUICK_FALLBACKS[lookupKey]) {
                                tagsToSearch = QUICK_FALLBACKS[lookupKey];
                                console.log(`[Quick Fallback] Resuelto por diccionario interno: "${tagsToSearch}"`);
                            } else {
                                console.log(`[TagManager] No está en CSV. Consultando IA / Proxy...`);
                                let resolvedTag = await askGroqForDanbooruTag(cleanQuery);

                                if (!resolvedTag) {
                                    resolvedTag = await fetchTagFromProxy(cleanQuery);
                                }

                                if (resolvedTag) {
                                    tagsToSearch = resolvedTag;
                                }
                            }
                        }

                        // Filtro de contenido según el canal y la petición
                        let ratingFilter = '';
                        if (!isNsfwChannel) {
                            ratingFilter = 'rating:general -penis -completely_nude -sex -futanari -breasts -nipples -nude';
                        } else if (requestedNsfw) {
                            ratingFilter = 'rating:explicit';
                        }

                        let finalTags = `${tagsToSearch} ${ratingFilter} sort:random`.trim();
                        console.log(`[Gelbooru Proxy] Consultando posts con tags: "${finalTags}"`);

                        let posts = await queryGelbooruProxy(finalTags);

                        // Si la búsqueda no arrojó resultados, probar con búsqueda por tag directo
                        if (!posts || posts.length === 0) {
                            console.log('[Gelbooru Proxy] 0 resultados. Reintentando búsqueda de tag alternativo...');
                            const directTag = await fetchTagFromProxy(cleanQuery);
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

                        console.log(`[Gelbooru Proxy] Se encontraron ${posts.length} posts. Mostrando primero...`);
                        let currentIndex = 0;

                        // Construcción de la carga útil con Embed y adjunto
                        const buildMessagePayload = async (index) => {
                            const post = posts[index];
                            // Usar sample si existe para acelerar la carga en Discord; para gifs usar file_url
                            const isGif = post.file_url?.toLowerCase().endsWith('.gif');
                            const rawUrl = isGif ? post.file_url : (post.sample_url || post.file_url || post.preview_url);
                            
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
                            try {
                                if (i.user.id !== message.author.id) {
                                    return await i.reply({ 
                                        content: `⚠️ Solo ${message.author.username} puede controlar esta búsqueda.`, 
                                        flags: 64 
                                    }).catch(() => {});
                                }

                                if (i.customId === 'exit') {
                                    collector.stop();
                                    await i.deferUpdate().catch(() => {});
                                    await replyMessage.delete().catch(() => {});
                                    return;
                                }

                                // PASO CLAVE: Responder de inmediato a Discord para evitar el Error 10062
                                await i.deferUpdate().catch(() => {});

                                if (i.customId === 'next') {
                                    currentIndex = (currentIndex + 1) % posts.length;
                                } else if (i.customId === 'prev') {
                                    currentIndex = (currentIndex - 1 + posts.length) % posts.length;
                                }

                                const payload = await buildMessagePayload(currentIndex);
                                payload.components = [buttons];

                                // Actualizar el mensaje tras descargar la imagen
                                await i.editReply(payload).catch(async () => {
                                    await replyMessage.edit(payload).catch(() => {});
                                });

                            } catch (collectorErr) {
                                console.error('[Collector Error] Error controlado al pasar página:', collectorErr.message);
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