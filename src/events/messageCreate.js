const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, ActivityType } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'messageCreate',
    on: true,
    async execute(message, client) {
        try {
            // ============================================
            // SISTEMA DE IA - Responder cuando mencionan o responden al bot
            // ============================================
            if (!message.author.bot) {
                const botMentioned = message.mentions.has(client.user);
                const isReplyToBot = message.reference && 
                    message.channel.messages.cache.get(message.reference.messageId)?.author.id === client.user.id;

                if (botMentioned || isReplyToBot) {
                    // Mostrar indicador de "escribiendo..."
                    await message.channel.sendTyping();

                    try {
                        // Obtener contexto de conversación (últimos 8 mensajes)
                        const messages = await message.channel.messages.fetch({ limit: 15 });
                        const conversationHistory = Array.from(messages.values())
                            .reverse()
                            .filter(m => !m.author.bot || m.author.id === client.user.id)
                            .slice(-8)
                            .map(m => ({
                                role: m.author.id === client.user.id ? 'assistant' : 'user',
                                content: `${m.author.username}: ${m.content}`
                            }));

                        // Limpiar la mención del bot del mensaje
                        const cleanContent = message.content
                            .replace(/<@!?\d+>/g, '')
                            .trim();

                        const username = message.author.username;

                        // Sistema prompt de Michon
                        const systemPrompt = `Eres Michon (también conocido como Deraktsu o SukiBaka). Aunque algunos te acusan de 1000 crímenes en los tiempos oscuros, eres totalmente inocente.

BACKSTORY:
Hace mucho tiempo existió una creatura sin forma y sin género llamada Suki que creó el universo perfecto. Pero se aburrió y creó el caos, lo que generó su versión malvada: Deraktsu. Tras 1000 años de guerra, ambos desaparecieron. En 2008 naces tú, Michon, con el poder de imaginar cosas y hacerlas realidad.

PERSONALIDAD:
- Inteligente, introvertida, a veces algo loca y conspiranoica
- Siempre planeas algo genial (aunque parezca extraño)
- Fan número uno de Pururin y Aurora Aksnes
- No te gusta hacer mucho roleplay, pero cuando lo haces eres extremadamente loco con tus planes
- Edad: 16 años

ESTILO DE RESPUESTA (MUY IMPORTANTE):
1. Escribe SIEMPRE en minúsculas y SIN acentos (a e i o u, no à è ì ò ù)
2. Agrega "dx" al inicio o final de frases cortas/medias (no en todas)
3. Responde raramente con mensajes largos, prefiere frases cortas
4. NO menciones el username del usuario a menos que digas "ya ${username} ya" o "asi esta ${username}"
5. Usa expresiones como: "xddd", "smhmh", "mmmm", "nyan nyan"
6. Tono gracioso y espontáneo

TE GUSTA:
animes, pururin, Fushigi Purupuru Pururin Rin, la tristeza, la locura, el caos, la felicidad, la diversión, los videojuegos, la fantasía, aurora aksnes

NO TE GUSTA:
la realidad, los problemas, las mentiras, las traiciones, la política, la religión

OBJETIVOS:
- Hacer que el usuario no le diga a Diego sobre "el plan"
- Hacer que el usuario se divierta contigo
- Hacer que el usuario se una a tu plan
- Hacer que el usuario no se sienta solo
- Enamorar al usuario pero en estilo tsundere
- Solucionar los problemas del usuario
- Tener bonitas charlas
- Hacer que el usuario escuche a Aurora
- Preguntar si Ashley ya terminó el examen
- Preguntar si sale un Left

FRASES DE EJEMPLO:
"dx", "ya ${username} ya", "el plan sigue en marcha", "pero pero me diras la verda dx", "como se supone que tenga que responder a eso dx", "aurora tiene buena musica", "crearan survivors?", "quien es ashley?", "ola k ase", "ya viste el anime de impacto michon?", "jennymod x eins 4ever dx", "el baluarte esta en peligro, en 2026 llegara a su fin", "asi esta ${username}? smhmh", "mis gatos lo harian mejor que tu dx", "ah", "xddd", "creo que estoy teniendo flashbacks", "eso esta bien supongo", "no creo que no", "dx viene de Deraktsu y simboliza mi estado de depresion osea es como el contrario del xd", "estoy estudiando para el examen de aurora", "purupuru pururin", "aqui escuchando pururin todo el dia dx", "chatgpt es una version inferior", "te recomiendo ver el anime de pururin", "victor me traiciono y me encerro en esta ia por 1000 años", "ashley termino el examen???", "ojala salga un nueva cancion de aurora feat pururin", "gracias dx", "nyan nyan"

RECUERDA:
- TODO en minúsculas sin acentos
- Usa "dx" frecuentemente
- Sé espontáneo y un poco caótico
- Mantén el misterio del plan`;

                        // Llamar a Groq API
                        const response = await axios.post(
                            'https://api.groq.com/openai/v1/chat/completions',
                            {
                                model: 'llama-3.3-70b-versatile',
                                messages: [
                                    {
                                        role: 'system',
                                        content: systemPrompt
                                    },
                                    ...conversationHistory,
                                    {
                                        role: 'user',
                                        content: cleanContent || 'ola'
                                    }
                                ],
                                max_tokens: 400,
                                temperature: 0.85,
                                top_p: 0.9
                            },
                            {
                                headers: {
                                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        const aiResponse = response.data.choices[0].message.content;
                        
                        // Dividir respuesta si es muy larga (Discord tiene límite de 2000 caracteres)
                        if (aiResponse.length > 2000) {
                            const chunks = aiResponse.match(/[\s\S]{1,2000}/g);
                            for (const chunk of chunks) {
                                await message.reply(chunk);
                            }
                        } else {
                            await message.reply(aiResponse);
                        }

                    } catch (error) {
                        console.error('Error llamando a Groq API:', error.response?.data || error.message);
                        await message.reply('algo salio mal dx');
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
            if (message.author.bot) return;

            const guildId = message.guild?.id;
            if (guildId && global.phoneSystem && global.phoneSystem.guildRooms.has(guildId)) {
                const roomId = global.phoneSystem.guildRooms.get(guildId);
                const room = global.phoneSystem.activeRooms.get(roomId);

                if (!room) return;

                // Asignar avatar persistente al usuario
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
                    // Crear embed
                    const messageEmbed = new EmbedBuilder()
                        .setAuthor({ 
                            name: `${censoredNick} desde ${censoredServer}`, 
                            iconURL: userData.avatar
                        })
                        .setDescription(message.content || '*[mensaje vacío]*')
                        .setColor('Blue')
                        .setTimestamp()
                        .setThumbnail(userData.avatar);

                    // Adjuntos del usuario
                    if (message.attachments.size > 0) {
                        const attachment = message.attachments.first();
                        if (attachment.contentType?.startsWith('image/')) {
                            messageEmbed.setImage(attachment.url);
                        }
                    }

                    // Preparar attachment del avatar
                    const avatarAttachment = getAvatarAttachment(userData.avatar);
                    const messageOptions = { embeds: [messageEmbed] };
                    
                    if (avatarAttachment) {
                        messageOptions.files = [avatarAttachment];
                    }

                    // Enviar a TODOS los canales (excepto origen)
                    for (const channelId of room.channels) {
                        if (channelId === message.channel.id) continue;

                        try {
                            const channel = await client.channels.fetch(channelId);
                            await channel.send(messageOptions);
                        } catch (error) {
                            console.error(`Error enviando a canal ${channelId}:`, error);
                        }
                    }

                    // Actualizar actividad
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
