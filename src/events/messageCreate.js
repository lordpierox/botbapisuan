const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const { resolveSearchQuery } = require('../utils/tagManager');

// Función para descargar la imagen en memoria con el Referer adecuado
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
        console.error('[Gelbooru Image Fetch] Error al descargar la imagen:', error.message);
        return null;
    }
}

// Función auxiliar para consultar a Groq y obtener tags de Danbooru en caso de fallo local
async function askGroqForDanbooruTag(query) {
    try {
        console.log(`[Groq AI Fallback] Consultando tag de Danbooru para la query: "${query}"`);
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un experto en tags de Danbooru y Gelbooru. El usuario te dará el nombre de un personaje, serie o descripción. Debes devolver EXCLUSIVAMENTE los tags oficiales de Danbooru separados por espacios (por ejemplo: asuka_langley_souryuu evangelion). No agregues texto adicional, explicaciones, comillas ni puntuación.'
                    },
                    {
                        role: 'user',
                        content: query
                    }
                ],
                max_tokens: 30,
                temperature: 0.2
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const aiTags = response.data.choices[0].message.content.trim().toLowerCase();
        console.log(`[Groq AI Fallback] Tags generados por la IA: "${aiTags}"`);
        return aiTags;
    } catch (error) {
        console.error('[Groq AI Fallback] Error al consultar Groq:', error.response?.data || error.message);
        return null;
    }
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
                        // Limpiar la mención del bot y los términos del comando
                        let cleanContent = message.content
                            .replace(/<@!?\d+>/g, '')
                            .toLowerCase();

                        let cleanQuery = cleanContent
                            .replace(/\b(manda|envia|busca|mandame|enviame|buscame)\b/gi, '')
                            .replace(/\b(imagen|imagenes|foto|fotos|dibujo|dibujos|de|del|un|una|algo)\b/gi, '')
                            .trim();

                        console.log(`[TagManager] Query limpia para procesar: "${cleanQuery}"`);

                        // 1. Intentar resolver localmente con los CSVs (0 tokens)
                        let tagsToSearch = resolveSearchQuery(cleanQuery);
                        console.log(`[TagManager] Tags resueltos localmente: "${tagsToSearch}"`);

                        // Configurar filtros NSFW según el canal
                        const isNsfwChannel = message.channel.nsfw || false;
                        const ratingFilter = isNsfwChannel ? '' : '-rating:explicit -rating:questionable';

                        let finalTags = `${tagsToSearch} ${ratingFilter} sort:random`.trim();
                        const proxyUrl = 'https://gelproxy.deraktsu.com/index.php';
                        
                        let params = new URLSearchParams({
                            page: 'dapi',
                            s: 'post',
                            q: 'index',
                            tags: finalTags,
                            json: '1',
                            limit: '10', // Traemos un lote para la paginación con botones
                            user_id: '2055792',
                            api_key: '492c6a96bc04c723915e7ae476716a7b88f6f52f8d38ebce0104c655e5d4faf0a82e1fcd0c145d268190eb1e4e88024256980b7f0d4ff81fc780242f4b200c92'
                        });

                        console.log(`[Gelbooru Proxy] Consultando posts con tags: "${finalTags}"`);
                        let response = await axios.get(`${proxyUrl}?${params.toString()}`, {
                            headers: { 'x-proxy-token': 'Ugotto1821' }
                        });

                        let posts = response.data?.post;

                        // 2. CICLO DE RESPALDO ÚNICO CON IA (Groq) si no hay resultados locales
                        if (!posts || posts.length === 0) {
                            console.log('[Gelbooru Proxy] No se encontraron resultados locales. Activando fallback de IA (Groq)...');
                            const aiTags = await askGroqForDanbooruTag(cleanQuery);
                            
                            if (aiTags) {
                                finalTags = `${aiTags} ${ratingFilter} sort:random`.trim();
                                params.set('tags', finalTags);

                                console.log(`[Gelbooru Proxy] Reintentando búsqueda con tags de IA: "${finalTags}"`);
                                response = await axios.get(`${proxyUrl}?${params.toString()}`, {
                                    headers: { 'x-proxy-token': 'Ugotto1821' }
                                });
                                posts = response.data?.post;
                            }
                        }

                        if (!posts || posts.length === 0) {
                            console.log('[Gelbooru Proxy] No se encontraron imágenes ni con el respaldo de IA.');
                            return message.reply('❌ No encontré ninguna imagen con esos tags dx.');
                        }

                        console.log(`[Gelbooru Proxy] Se encontraron ${posts.length} posts con éxito.`);
                        let currentIndex = 0;

                        // Función para construir el mensaje con embed y archivo adjunto seguro
                        const buildMessagePayload = async (index) => {
                            const post = posts[index];
                            const rawUrl = post.sample_url || post.file_url || post.preview_url;
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
                                    content: `⚠️ Solo ${message.author.username} puede usar estos botones`, 
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
                            replyMessage.edit({ components: [buttons] }).catch(() => {});
                        });

                    } catch (error) {
                        console.error('[Error General] En búsqueda de Gelbooru:', error);
                        return message.reply('Hubo un error buscando la imagen dx.');
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