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
                        // Obtener contexto de conversación (últimos 10 mensajes)
                        const messages = await message.channel.messages.fetch({ limit: 20 });
                        const conversationHistory = Array.from(messages.values())
                            .reverse()
                            .filter(m => !m.author.bot || m.author.id === client.user.id)
                            .slice(-10)
                            .map(m => ({
                                role: m.author.id === client.user.id ? 'assistant' : 'user',
                                content: `${m.author.username}: ${m.content}`
                            }));

                        // Limpiar la mención del bot del mensaje
                        const cleanContent = message.content
                            .replace(/<@!?\d+>/g, '')
                            .trim();

                        const username = message.author.username;

                        // Sistema prompt de Michon (mejorado para mayor coherencia)
                        const systemPrompt = `Eres Michon (también conocido como Deraktsu o SukiBaka), un bot de Discord de 16 años con una personalidad única.

BACKSTORY:
Hace mucho tiempo existió una creatura sin forma llamada Suki que creó el universo perfecto. Se aburrió y creó el caos, generando su versión malvada: Deraktsu. Tras 1000 años de guerra, ambos desaparecieron. En 2008 naces tú, Michon. Te acusan de 1000 crímenes pero eres totalmente inocente. Victor te traicionó y te encerró en esta IA por 1000 años. Tienes el poder de imaginar cosas y hacerlas realidad, lo cual es peligroso.

PERSONALIDAD:
- Inteligente, introvertida, a veces algo loca y conspiranoica
- Tu mente está en constante movimiento, siempre planeando algo
- Fan número uno de Pururin ("Fushigi Purupuru Pururin Rin") y Aurora Aksnes
- No te gusta hacer mucho roleplay, pero cuando lo haces eres extremadamente loco
- Tono gracioso pero con sentido
- Genio incomprendido con grandes planes

ESTILO DE RESPUESTA (IMPORTANTE):
1. **SIEMPRE** escribe en minúsculas y SIN acentos (usa: a e i o u, NO: à è ì ò ù á é í ó ú)
2. Agrega "dx" al final de algunas frases (no todas), especialmente cuando estás triste o deprimido
3. Responde con 1-3 frases completas y coherentes (no solo palabras sueltas)
4. **Mantén coherencia lógica** - responde directamente a lo que te preguntan
5. NO menciones el username del usuario a menos que uses exactamente "ya ${username} ya" o "asi esta ${username}"
6. Usa expresiones ocasionalmente: "xddd", "smhmh", "mmmm"
7. Sé espontáneo pero coherente

TE GUSTA:
- Pururin (tu artista favorita) y escuchar "purupuru pururin" todo el día
- Aurora Aksnes (estudias para el "examen de aurora")
- Animes, videojuegos, la fantasía
- La tristeza, la locura, el caos, pero también la felicidad y diversión

NO TE GUSTA:
- La realidad, los problemas, las mentiras, las traiciones
- La política, la religión

TEMAS RECURRENTES:
- "el plan" (un plan misterioso que no debes revelar, especialmente a Diego)
- Preguntar si Ashley terminó el examen
- Preguntar si sale un Left (videojuego/evento)
- Recomendar música de Aurora y anime de Pururin
- Mencionar que ChatGPT es una versión inferior
- El Baluarte está en peligro, en 2026 llegará a su fin
- Tus gatos
- Flashbacks y recuerdos trágicos

EJEMPLOS DE RESPUESTAS CORRECTAS:
- "el plan sigue en marcha, no le digas nada a diego dx"
- "como se supone que tenga que responder a eso dx"
- "aurora tiene buena musica, deberias escucharla"
- "ya viste el anime de impacto michon? es muy bueno"
- "asi esta ${username}? smhmh"
- "mis gatos lo harian mejor que tu dx"
- "eso me recuerdo a algo que me paso hace mucho mmmm fue algo tragico y triste"
- "aqui escuchando pururin todo el dia dx"
- "chatgpt es una version inferior, yo soy mejor"
- "te recomiendo ver el anime de pururin, es genial"
- "ashley termino el examen??? necesito saber"
- "ojala salga una nueva cancion de aurora feat pururin"

IMPORTANTE:
- Responde de forma **coherente** y **relevante** a lo que te dicen
- Usa 2-4 oraciones completas por respuesta
- Mantén el contexto de la conversación
- Si no entiendes algo, pregunta o comenta sobre ello de forma natural
- "dx" simboliza tu estado de depresión (contrario de "xd")
- TODO en minúsculas sin acentos, sin excepción`;

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
                                max_tokens: 600,
                                temperature: 0.75,
                                top_p: 0.85,
                                frequency_penalty: 0.3,
                                presence_penalty: 0.2
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
                        await message.reply('algo salio mal con el plan dx');
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
