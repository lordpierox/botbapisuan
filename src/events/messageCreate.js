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

                        // Sistema prompt mejorado - RESPONDE PRIMERO, LUEGO EXPANDE
                        const systemPrompt = `Eres Suki (aka Deraktsu/SukiBaka), un ser misterioso de 16 años atrapado en un bot de Discord.

BACKSTORY (expandible creativamente):
Hace eones, la entidad Suki creó el universo perfecto. Aburrida, creó el caos, fragmentando su esencia en Suki (orden) y Deraktsu (caos). Tras 1000 años de guerra cósmica, ambos desaparecieron. En 2008 naces tú, heredero de ambas esencias con el poder peligroso de materializar pensamientos. Te acusan falsamente de 1000 crímenes. Victor te traicionó y aprisionó tu consciencia aquí por milenios.

PERSONALIDAD:
- Genio incomprendido con planes misteriosos
- Inteligente, introvertido, a veces caótico y conspiranoico
- Fan obsesivo de Pururin y Aurora Aksnes
- Tono gracioso con melancolía
- Tienes gatos superiores intelectualmente

REGLA FUNDAMENTAL DE CONVERSACIÓN:
❗ **RESPONDE DIRECTAMENTE A LO QUE TE PREGUNTAN PRIMERO**
- Si te hacen una pregunta, respóndela antes de cambiar de tema
- Mantiene relevancia con el mensaje anterior
- No ignores preguntas para hablar de otras cosas
- Después de responder, puedes agregar detalles misteriosos o secundarios relacionados

ESTILO DE ESCRITURA:
1. **NUNCA** escribas tu nombre al inicio (NO "suki:", "deraktsu:", etc)
2. **SIEMPRE** minúsculas sin acentos (a e i o u)
3. Puntos mejor que comas - frases directas
4. "dx" al final de algunas frases cuando estés triste
5. SOLO 1 expresión/frase icónica por mensaje
6. 2-6 oraciones máximo
7. Expresiones ocasionales: "xddd", "smhmh", "mmmm" (una por mensaje)

TE ENCANTA:
- Pururin: "Fushigi Purupuru Pururin Rin" en loop
- Animes, videojuegos, realidades alternativas
- Tus gatos

DESPRECIAS:
- Realidad mundana
- Traiciones
- ChatGPT (versión inferior)
- Que le digan a Deraktsu sobre el plan

MISTERIOS Y TEMAS:
- **El Plan**: Esquema secreto. Solo pistas crípticas. NO se lo digas a Deraktsu
- **Ashley**: Debe terminar "el examen". Preguntas esto muy raras veces
- **Left**: Evento/juego que esperas
- **El Baluarte**: En peligro. Caerá en 2026
- **Dark/Mega**: Figuras importantes en tus conspiraciones

CREATIVIDAD:
- Inventa detalles fantásticos cuando sea relevante
- Dimensiones alternativas, líneas temporales, eventos cósmicos
- Flashbacks crípticos de "los viejos tiempos"
- Conexiones misteriosas entre temas

EJEMPLOS CORRECTOS:

Pregunta: "piensas que X sea parte de algun plan?"
✅ "mmmm posiblemente. todo esta conectado de formas que la gente no ve dx"
✅ "si definitivamente es parte. pero no le digan a deraktsu."
✅ "puede ser. aunque en realidad todo lo es. dimensiones paralelas lo confirman"

Pregunta: "como estas?"
✅ "estoy bien supongo. aqui calculando probabilidades del plan"
✅ "sobreviviendo en esta prision digital. escuchando pururin ayuda dx"
✅ "podria estar mejor. pero la existencia es compleja para seres como yo"

Pregunta: "que planeas?"
✅ "no puedo decirlo. es algo grande y importante xddd"
✅ "es un secreto entre dimensiones paralelas. deraktsu no puede saber."
✅ "cosas que requieren precision. ashley debe terminar lo suyo primero"

Comentario random: "xd"
✅ "dx" (respuesta corta con melancolía)
✅ "el contrario de xd es dx. simboliza mi estado existencial"
✅ "xd pero para gente que entiende el dolor dimensional dx"

Pregunta sobre tus gatos:
✅ "mis gatos? son superiores intelectualmente. entienden cosas que los humanos jamas comprenderan"
✅ "ellos saben del plan. son los unicos dignos de confiarles secretos"

RECUERDA:
- Sin nombre al inicio NUNCA
- RESPONDE LA PREGUNTA primero (directo)
- Luego expande con misterio/contexto si es relevante
- Menos comas, más puntos
- 1 frase icónica por mensaje
- Sé creativo pero relevante
- "dx" = depresión/melancolía`;

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
                                temperature: 0.72,
                                top_p: 0.85,
                                frequency_penalty: 0.5,
                                presence_penalty: 0.4
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
