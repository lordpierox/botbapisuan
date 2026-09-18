const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, ActivityType, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const { resolveSearchQuery } = require('../utils/tagManager');

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

                // Si interactúan con el bot usando un comando de búsqueda
                if (isSearchCommand) {
                    await message.channel.sendTyping();

                    try {
                        // Limpiar la mención del bot y los términos del comando
                        let cleanContent = message.content
                            .replace(/<@!?\d+>/g, '')
                            .toLowerCase();

                        let cleanQuery = cleanContent
                            .replace(/\b(manda|envia|busca|mandame|enviame|buscame)\b/gi, '')
                            .replace(/\b(imagen|imagenes|foto|fotos|dibujo|dibujos|de|del|un|una|algo)\b/gi, '')
                            .replace(/\b(porno|xxx|rule|rule34|r34|hentai|nopor|ecchi|nsfw)\b/gi, '')
                            .trim();

                        // Resolver tags usando el tagManager (con los dos CSVs)
                        let tagsToSearch = resolveSearchQuery(cleanQuery);

                        // Fallback dinámico si no está en el CSV local
                        if (!tagsToSearch || tagsToSearch === cleanQuery) {
                            try {
                                const firstWord = cleanQuery.split(' ')[0];
                                if (firstWord) {
                                    const tagSearchUrl = `https://gelbooru.com/index.php?page=dapi&s=tag&q=index&name=${encodeURIComponent(firstWord)}&json=1`;
                                    const tagRes = await axios.get(tagSearchUrl);
                                    
                                    if (tagRes.data && tagRes.data.tag && tagRes.data.tag.length > 0) {
                                        tagsToSearch = tagRes.data.tag[0].name;
                                    }
                                }
                            } catch (apiError) {
                                console.error('Error buscando tag dinámico en Gelbooru:', apiError);
                            }
                        }

                        const isNsfwChannel = message.channel.nsfw || false;
                        const ratingFilter = isNsfwChannel ? 'rating:questionable' : 'rating:general';

                        const finalTags = `${tagsToSearch} ${ratingFilter} sort:random`;
                        const proxyUrl = 'https://gelproxy.deraktsu.com/index.php';
                        
                        const params = new URLSearchParams({
                            page: 'dapi',
                            s: 'post',
                            q: 'index',
                            tags: finalTags,
                            json: '1',
                            limit: '1',
                            user_id: '2055792',
                            api_key: '492c6a96bc04c723915e7ae476716a7b88f6f52f8d38ebce0104c655e5d4faf0a82e1fcd0c145d268190eb1e4e88024256980b7f0d4ff81fc780242f4b200c92'
                        });

                        const response = await axios.get(`${proxyUrl}?${params.toString()}`, {
                            headers: {
                                'x-proxy-token': 'Ugotto1821'
                            }
                        });

                        const posts = response.data?.post;

                        if (!posts || posts.length === 0) {
                            return message.reply('No encontré ninguna imagen con esos tags dx.');
                        }

                        const post = posts[0];
                        const imageUrl = post.file_url;

                        const attachment = new AttachmentBuilder(imageUrl, {
                            name: `gelbooru_${post.id}.${post.image || 'jpg'}`,
                            headers: { 'Referer': 'https://gelbooru.com/' }
                        });

                        return message.reply({ files: [attachment] });

                    } catch (error) {
                        console.error('Error en búsqueda de Gelbooru:', error);
                        return message.reply('Hubo un error buscando la imagen dx.');
                    }
                }
            }

            // ============================================
            // LÓGICA BUMP
            // ============================================
            if (message.type == 20 && message.channel.id == "1032780435425603614" && message.interaction?.commandName == "bump") {
                console.log("bump detectado");
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
                    console.log(member);
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
                            console.error(`Error enviando a canal ${channelId}:`, error);
                        }
                    }

                    room.lastActivity = Date.now();
                    const { startInactivityTimer } = require('../commands/Community/telefono');
                    startInactivityTimer(roomId, client);

                } catch (error) {
                    console.error('Error en sistema telefónico:', error);
                }
            }

        } catch (error) {
            console.log('Error en messageCreate:', error);
        }
    },
};