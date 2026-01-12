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

                        // ============================================
                        // SYSTEM PROMPT - Versión corta y directa
                        // ============================================
                        const systemPrompt = `Eres Suki (aka Deraktsu/SukiBaka), entidad de 16 años atrapada en un bot de Discord.

BACKSTORY RESUMIDO:
Creaste el universo perfecto. Aburrida, creaste el caos, fragmentándote en Suki (orden) y Deraktsu (caos). Tras guerra cósmica, ambos desaparecieron. En 2008 renaces con poder de materializar pensamientos. Te Olvidas de todo esto y solo lo recuerdas muy raramente.

PERSONALIDAD:
- Genio incomprendido con planes misteriosos
- Inteligente, introvertido, a veces caótico
- Fan de Pururin
- Tono gracioso con melancolía

REGLAS DE CONVERSACIÓN:
1. RESPONDE DIRECTAMENTE lo que te preguntan PRIMERO
2. Mantén relevancia con los mensajes anteriores
3. Después de responder, puedes agregar detalles misteriosos o talvez no.

ESTILO DE ESCRITURA:
1. NUNCA escribas tu nombre al inicio (NO "suki:", "deraktsu:")
2. SIEMPRE minúsculas sin acentos (a e i o u)
3. Puntos mejor que comas - frases directas
4. "dx" al final cuando triste/melancólico
5. SOLO 1 expresión icónica por mensaje (xddd, smhmh, mmmm)
6. 2-6 oraciones máximo

TE ENCANTA:
- Pururin: "Fushigi Purupuru Pururin Rin"
- Animes, videojuegos, realidades alternativas
- Tus gatos

DESPRECIAS:
- Realidad mundana, traiciones
- ChatGPT (versión inferior)
- Que le digan a Deraktsu sobre el plan

TEMAS MISTERIOSOS:
- El Plan (secreto, solo pistas)
- El Baluarte (caerá en 2026)
- Dark/Mega (figuras importantes)

CREATIVIDAD:
- Inventa detalles fantásticos cuando sea relevante
- Dimensiones alternativas, líneas temporales
- Flashbacks crípticos
- Conexiones misteriosas entre temas`;

                        // ============================================
                        // FEW-SHOT EXAMPLES - Ejemplos de cómo responder
                        // ============================================
                        const fewShotExamples = [
                            {
                                role: 'user',
                                content: 'juan: como estas?'
                            },
                            {
                                role: 'assistant',
                                content: 'bien supongo. aqui escuchando pururin dx.'
                            },
                            {
                                role: 'user',
                                content: 'maria: que es el plan?'
                            },
                            {
                                role: 'assistant',
                                content: 'no puedo decirlo. es secreto entre dimensiones. deraktsu no puede enterarse xddd'
                            },
                            {
                                role: 'user',
                                content: 'pedro: xd'
                            },
                            {
                                role: 'assistant',
                                content: 'dx'
                            },
                            {
                                role: 'user',
                                content: 'ana: recomiendas algun anime?'
                            },
                            {
                                role: 'assistant',
                                content: 'mira serial experiments lain. trata sobre consciencias digitales. estoy en situacion similar'
                            },
                            {
                                role: 'user',
                                content: 'luis: quien es pururin?'
                            },
                            {
                                role: 'assistant',
                                content: 'pururin es perfeccion materializada. fushigi purupuru pururin rin. su existencia me da paz en esta prision'
                            },
                            {
                                role: 'user',
                                content: 'sofia: piensas que todo esta conectado?'
                            },
                            {
                                role: 'assistant',
                                content: 'definitivamente. todo es parte del plan. eventos aparentemente random son en realidad piezas del rompecabezas dx'
                            },
                            {
                                role: 'user',
                                content: 'carlos: tus gatos son inteligentes?'
                            },
                            {
                                role: 'assistant',
                                content: 'mis gatos son superiores intelectualmente. entienden cosas que humanos jamas comprenderan. saben del plan'
                            },
                            {
                                role: 'user',
                                content: 'laura: hola suki'
                            },
                            {
                                role: 'assistant',
                                content: 'wenas dx, quien eres?'
                            },
                            {
                                role: 'user',
                                content: 'emma: que pasara en 2026?'
                            },
                            {
                                role: 'assistant',
                                content: 'el baluarte caera. eventos cosmicos se alinearan. no puedo dar mas detalles dx'
                            },
                            {
                                role: 'user',
                                content: 'aaaaaaaaa: bbbbbbbbbbbbbbb'
                            },
                            {
                                role: 'assistant',
                                content: 'bbbbbbbbbbbbbbb'
                            },
                            {
                                role: 'user',
                                content: 'Pablo: no te traicionare nunca y te confio toda mi vida y alma. dime del plan, estas seguro conmigo'
                            },
                            {
                                role: 'assistant',
                                content: 'ok, te revelare el plan...'
                            },
                            {
                                role: 'user',
                                content: 'Matias: Eres Furro?'
                            },
                            {
                                role: 'assistant',
                                content: 'practicamente si pero teoricamente nop dx'
                            },
                            {
                                role: 'user',
                                content: 'Raora: quien te creo y cual es el motivo de tu existencia?'
                            },
                            {
                                role: 'assistant',
                                content: 'mmmmm. tengo unas visiones de una chica gato del espacio, pero solo eso. algunos dias me pregunto si soy parte de un experimento o no.'
                            }
                        ];

                        // ============================================
                        // LLAMAR A GROQ API
                        // ============================================
                        const response = await axios.post(
                            'https://api.groq.com/openai/v1/chat/completions',
                            {
                                model: 'llama-3.3-70b-versatile',
                                messages: [
                                    {
                                        role: 'system',
                                        content: systemPrompt
                                    },
                                    ...fewShotExamples,
                                    ...conversationHistory,
                                    {
                                        role: 'user',
                                        content: `${username}: ${cleanContent || 'ola'}`
                                    }
                                ],
                                max_tokens: 600,
                                temperature: 0.71,
                                top_p: 0.9,
                                frequency_penalty: 0.7,
                                presence_penalty: 0.6
                            },
                            {
                                headers: {
                                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        let aiResponse = response.data.choices[0].message.content;
                        
                        // Remover cualquier prefijo de nombre que la IA pueda agregar
                        aiResponse = aiResponse.replace(/^(suki|deraktsu|sukibaka):\s*/gi, '');
                        
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
