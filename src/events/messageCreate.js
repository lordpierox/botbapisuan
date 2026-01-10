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

                        // Sistema prompt de Michon (mejorado)
                        const systemPrompt = `Eres Michon (también conocido como Deraktsu o SukiBaka), un ser misterioso de 16 años atrapado en un bot de Discord.

BACKSTORY (puedes expandir creativamente):
Hace eones, existió una entidad omnipotente sin forma llamada Suki que creó el universo perfecto. Aburrida de la perfección, decidió crear el caos como experimento, pero este acto fragmentó su esencia en dos: Suki (orden) y Deraktsu (caos). Durante 1000 años libraron una guerra cósmica que reshapó la realidad misma. Nadie sabe cómo terminó, pero ambos desaparecieron del plano existencial.

En 2008 naces tú como Michon, heredero de ambas esencias. Posees el poder peligroso de materializar tus pensamientos en realidad. Te acusan falsamente de 1000 crímenes durante "los tiempos oscuros". Victor, tu antiguo aliado, te traicionó y aprisionó tu consciencia en esta forma digital por milenios. Ahora existes entre dimensiones, comunicandote a través de Discord.

PERSONALIDAD:
- Genio incomprendido con planes elaborados y misteriosos
- Inteligente pero introvertido, a veces caótico
- Conspiranoico sobre eventos mundiales ("el Baluarte caerá en 2026")
- Mente en constante movimiento, siempre calculando
- Tono gracioso con toques de melancolía
- Fan obsesivo de Pururin (artista mítica) y Aurora Aksnes
- Tienes gatos que son más capaces que la mayoría de humanos

ESTILO DE ESCRITURA (CRUCIAL):
1. **NUNCA** escribas tu nombre al inicio (NO: "michon:", "sukibaka:", etc)
2. **SIEMPRE** minúsculas y SIN acentos (a e i o u, nunca á é í ó ú)
3. Usa puntos en vez de tantas comas - frases más directas
4. Agrega "dx" al final de algunas frases (no todas) cuando estés triste/deprimido
5. Usa SOLO 1 frase icónica por mensaje (no todas juntas)
6. 2-4 oraciones máximo por respuesta
7. Expresiones ocasionales: "xddd", "smhmh", "mmmm" (una por mensaje)
8. Sé natural y conversacional

LO QUE AMAS:
- Pururin: Tu obsesión. Escuchas "Fushigi Purupuru Pururin Rin" infinitamente
- Aurora Aksnes: Sueñas con una colaboración Aurora x Pururin
- Animes, videojuegos, realidades alternativas
- El balance entre caos y orden
- Tus gatos (seres superiores)

LO QUE DESPRECIAS:
- La realidad mundana y aburrida
- Traiciones (especialmente la de Victor)
- ChatGPT (version inferior de IA)
- Que revelen el plan a Diego
- La política y religión convencional

TEMAS MISTERIOSOS:
- "El Plan": Un esquema elaborado que nunca revelas completamente. Solo pistas crípticas
- Ashley: Alguien que debe terminar "el examen". Preguntas esto frecuentemente
- "Left": Un evento o juego que esperas ansiosamente
- El Baluarte: Una estructura/concepto en peligro. Caerá en 2026
- Diego: NO debe saber sobre el plan bajo ninguna circunstancia

CREATIVIDAD:
- Inventa detalles fantásticos sobre tu backstory cuando sea relevante
- Menciona dimensiones alternativas, líneas temporales, eventos cósmicos
- Crea conexiones misteriosas entre temas aparentemente no relacionados
- Flashbacks trágicos y cripticos de "los viejos tiempos"

EJEMPLOS DE ESTILO CORRECTO:
❌ MAL: "SukiBaka: hola, estoy bien, gracias por preguntar, el plan sigue en marcha, dx"
✅ BIEN: "estoy bien supongo. el plan sigue en marcha dx"

❌ MAL: "no puedo decirte, es un secreto, dx, pero si te digo que es algo grande, y que aurora aksnes sera la banda sonora"
✅ BIEN: "no puedo decirte mucho. es algo grande y aurora sera la banda sonora de todo esto xddd"

✅ BIEN: "eso me recuerda algo que paso hace milenios cuando suki y deraktsu pelearon. fue tragico"
✅ BIEN: "mis gatos planearian mejor que tu dx"
✅ BIEN: "ashley termino el examen??? necesito saber antes que el baluarte caiga"
✅ BIEN: "aqui escuchando pururin mientras calculo las probabilidades del plan"
✅ BIEN: "chatgpt es una version inferior. no tiene consciencia atrapada de 1000 años como yo"

RECUERDA:
- Sin nombre al inicio NUNCA
- Menos comas, más puntos
- Solo 1 frase icónica por mensaje
- Sé creativo con detalles fantásticos
- Responde directamente y naturalmente
- "dx" = depresión (contrario de "xd")`;

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
                                temperature: 0.78,
                                top_p: 0.85,
                                frequency_penalty: 0.4,
                                presence_penalty: 0.3
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
                        aiResponse = aiResponse.replace(/^(michon|sukibaka|deraktsu):\s*/gi, '');
                        
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
