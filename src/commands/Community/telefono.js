const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ============================================
// CARGAR AVATARES DESDE CARPETA LOCAL
// ============================================
const PHONE_AVATARS_PATH = path.join(__dirname, '../../assets/img/phone');
let AVATAR_FILES = [];

try {
    AVATAR_FILES = fs.readdirSync(PHONE_AVATARS_PATH)
        .filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext);
        })
        .map(file => path.join(PHONE_AVATARS_PATH, file));

    console.log(`📞 Sistema telefónico: ${AVATAR_FILES.length} avatares cargados desde ${PHONE_AVATARS_PATH}`);
    
    if (AVATAR_FILES.length === 0) {
        console.warn('⚠️ No se encontraron imágenes en la carpeta de avatares. Usando fallback URLs.');
        AVATAR_FILES = [
            'https://i.imgur.com/4M34hi2.png',
            'https://i.imgur.com/OvKQQrM.png',
            'https://i.imgur.com/7D4Hc8Q.png',
            'https://i.imgur.com/x9aDKSb.png',
            'https://i.imgur.com/8Q7Yx4V.png',
        ];
    }
} catch (error) {
    console.error('❌ Error cargando avatares:', error);
    AVATAR_FILES = [
        'https://i.imgur.com/4M34hi2.png',
        'https://i.imgur.com/OvKQQrM.png',
        'https://i.imgur.com/7D4Hc8Q.png',
    ];
}

// Sistema global
if (!global.phoneSystem) {
    global.phoneSystem = {
        waitingQueue: [],
        activeRooms: new Map(),
        guildRooms: new Map(),
    };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('telefono')
        .setDescription('Sistema de llamadas entre servidores')
        .addSubcommand(subcommand =>
            subcommand
                .setName('llamar')
                .setDescription('Inicia una llamada con otros servidores'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('colgar')
                .setDescription('Termina la llamada actual')),

    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'llamar') {
            await handleLlamar(interaction, client);
        } else if (subcommand === 'colgar') {
            await handleColgar(interaction, client);
        }
    },
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function censorNick(nickname) {
    if (!nickname) return nickname;
    
    // Si es muy corto, no censurar
    if (nickname.length <= 3) return nickname;
    
    let result = nickname.slice(0, 3); // Primeros 3 caracteres
    
    // Para el resto: mantener espacios, cambiar letras por *
    for (let i = 3; i < nickname.length; i++) {
        const char = nickname[i];
        if (char === ' ') {
            result += ' '; // Mantener espacios
        } else {
            result += '*'; // Cambiar letras por asteriscos
        }
    }
    
    return result;
}

function censorServer(serverName) {
    if (!serverName) return serverName;
    
    // Si es muy corto, no censurar
    if (serverName.length <= 3) return serverName;
    
    let result = serverName.slice(0, 3); // Primeros 3 caracteres
    
    // Para el resto: mantener espacios, cambiar letras por *
    for (let i = 3; i < serverName.length; i++) {
        const char = serverName[i];
        if (char === ' ') {
            result += ' '; // Mantener espacios
        } else {
            result += '*'; // Cambiar letras por asteriscos
        }
    }
    
    return result;
}



function getRandomAvatar() {
    const randomFile = AVATAR_FILES[Math.floor(Math.random() * AVATAR_FILES.length)];
    
    if (randomFile.startsWith('http')) {
        return randomFile;
    }
    
    return `attachment://${path.basename(randomFile)}`;
}

function getAvatarAttachment(avatarPath) {
    if (avatarPath.startsWith('http')) {
        return null;
    }
    
    const fileName = avatarPath.replace('attachment://', '');
    const fullPath = AVATAR_FILES.find(f => path.basename(f) === fileName);
    
    if (!fullPath) return null;
    
    return new AttachmentBuilder(fullPath, { name: fileName });
}

function generateRoomId() {
    return `room_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

// ============================================
// SUBCOMANDO: /telefono llamar (CON DEBUG)
// ============================================
async function handleLlamar(interaction, client) {
    try {
        console.log('📞 [TELEFONO] Comando llamar iniciado');
        
        await interaction.deferReply();
        console.log('📞 [TELEFONO] DeferReply exitoso');

        const channelId = interaction.channelId;
        const guildId = interaction.guildId;
        const guild = interaction.guild;

        console.log('📞 [TELEFONO] Guild:', guild.name);
        console.log('📞 [TELEFONO] IDs:', { channelId, guildId });

        // Verificar si este GUILD ya está en una llamada
        if (global.phoneSystem.guildRooms.has(guildId)) {
            console.log('📞 [TELEFONO] Guild ya en llamada');
            return await interaction.editReply({
                content: '📞 **Este servidor ya está en una llamada activa.**\nUsa `/telefono colgar` para terminarla primero.'
            });
        }

        // Verificar si ya está en cola
        const alreadyWaiting = global.phoneSystem.waitingQueue.find(
            entry => entry.guildId === guildId
        );

        if (alreadyWaiting) {
            console.log('📞 [TELEFONO] Guild ya esperando');
            return await interaction.editReply({
                content: '⏳ **Este servidor ya está esperando una llamada.**'
            });
        }

        console.log('📞 [TELEFONO] Buscando salas activas...');
        console.log('📞 [TELEFONO] Salas disponibles:', global.phoneSystem.activeRooms.size);
        console.log('📞 [TELEFONO] Cola actual:', global.phoneSystem.waitingQueue.length);

        // Buscar sala activa con espacio
        let targetRoom = null;

        for (const [roomId, room] of global.phoneSystem.activeRooms) {
            console.log(`📞 [TELEFONO] Sala ${roomId}: ${room.channels.size} canales`);
            if (room.channels.size < 10) {
                targetRoom = { roomId, room };
                break;
            }
        }

        if (targetRoom) {
            // ✅ UNIRSE A SALA EXISTENTE
            console.log('📞 [TELEFONO] Uniéndose a sala existente');
            const { roomId, room } = targetRoom;

            room.channels.add(channelId);
            global.phoneSystem.guildRooms.set(guildId, roomId);

            const joinEmbed = new EmbedBuilder()
                .setTitle('📞 ¡Nuevo Participante!')
                .setDescription(`**Nick:** ${censorNick(interaction.user.displayName || interaction.user.username)}\n**Server:** ${censorServer(guild.name)}\n\n👥 **Participantes:** ${room.channels.size} servidor(es) conectados.`)
                .setColor('Blue')
                .setTimestamp();

            for (const cId of room.channels) {
                try {
                    const channel = await client.channels.fetch(cId);
                    await channel.send({ embeds: [joinEmbed] });
                } catch (e) {
                    console.error('📞 [TELEFONO] Error enviando:', e);
                }
            }

            await interaction.editReply({
                content: `✅ **¡Conectado a la llamada grupal!**\n${interaction.user} ha unido a **${guild.name}** a la conversación.\n\n👥 Ahora hay **${room.channels.size} servidores** conectados.`
            });

            console.log('📞 [TELEFONO] Unión exitosa');
            startInactivityTimer(roomId, client);

        } else if (global.phoneSystem.waitingQueue.length > 0) {
            // ✅ HAY OTROS ESPERANDO - CONECTAR INMEDIATAMENTE
            console.log('📞 [TELEFONO] Conectando con', global.phoneSystem.waitingQueue.length, 'en cola');

            const roomId = generateRoomId();
            const newRoom = {
                channels: new Set([channelId]),
                users: new Map(),
                lastActivity: Date.now(),
                timeout: null
            };

            // Añadir todos los de la cola
            for (const entry of global.phoneSystem.waitingQueue) {
                newRoom.channels.add(entry.channelId);
                global.phoneSystem.guildRooms.set(entry.guildId, roomId);
            }

            // Añadir el actual
            global.phoneSystem.guildRooms.set(guildId, roomId);
            global.phoneSystem.activeRooms.set(roomId, newRoom);

            // Limpiar cola
            global.phoneSystem.waitingQueue = [];

            console.log('📞 [TELEFONO] Sala creada con', newRoom.channels.size, 'canales');

            // Notificar a todos
            const connectEmbed = new EmbedBuilder()
                .setTitle('📞 ¡Llamada Conectada!')
                .setDescription(`Se ha establecido una conexión grupal con **${newRoom.channels.size} servidores**.\n\n**Escribe mensajes normales** y serán enviados a todos.\n\n🔴 La llamada se cerrará después de **6 minutos** sin mensajes.\n💬 Usa \`/telefono colgar\` para salir.`)
                .setColor('Green')
                .setTimestamp();

            for (const cId of newRoom.channels) {
                try {
                    const channel = await client.channels.fetch(cId);
                    await channel.send({ embeds: [connectEmbed] });
                } catch (e) {
                    console.error('📞 [TELEFONO] Error conectando:', e);
                }
            }

            await interaction.editReply({
                content: `✅ **¡Llamada conectada!**\n${interaction.user} ha conectado con **${newRoom.channels.size - 1} otro(s) servidor(es)**!`
            });

            startInactivityTimer(roomId, client);

        } else {
            // ✅ NADIE ESPERANDO - AÑADIR A COLA
            console.log('📞 [TELEFONO] Nadie esperando, añadiendo a cola');

            const queueEntry = {
                channelId,
                guildId,
                guildName: guild.name,
                userId: interaction.user.id,
                timestamp: Date.now()
            };

            global.phoneSystem.waitingQueue.push(queueEntry);
            console.log('📞 [TELEFONO] Añadido a cola. Total:', global.phoneSystem.waitingQueue.length);

            const waitEmbed = new EmbedBuilder()
                .setTitle('📞 Esperando Llamada...')
                .setDescription(`${interaction.user} está buscando una conexión...\n\n⏳ Esperando hasta **3 minutos** por otra persona.\n\nSi alguien en otro servidor usa \`/telefono llamar\`, la llamada se conectará **inmediatamente**.`)
                .setColor('Orange')
                .setTimestamp();

            await interaction.editReply({
                embeds: [waitEmbed]
            });

            console.log('📞 [TELEFONO] Mensaje de espera enviado');

            // Timeout de 3 minutos para limpiar la cola
            setTimeout(() => {
                console.log('📞 [TELEFONO] Timeout alcanzado, verificando cola');
                const stillWaiting = global.phoneSystem.waitingQueue.find(
                    entry => entry.guildId === guildId
                );

                if (stillWaiting) {
                    console.log('📞 [TELEFONO] Nadie se conectó, removiendo de cola');
                    global.phoneSystem.waitingQueue = global.phoneSystem.waitingQueue.filter(
                        entry => entry.guildId !== guildId
                    );

                    const timeoutEmbed = new EmbedBuilder()
                        .setTitle('⏱️ Tiempo Agotado')
                        .setDescription('No se encontró a nadie disponible.\nIntenta de nuevo más tarde.')
                        .setColor('Red')
                        .setTimestamp();

                    client.channels.fetch(channelId).then(channel => {
                        channel.send({ embeds: [timeoutEmbed] });
                    }).catch(e => console.error('📞 [TELEFONO] Error timeout:', e));
                } else {
                    console.log('📞 [TELEFONO] Guild ya conectado (ok)');
                }
            }, 180000); // 3 minutos
        }
    } catch (error) {
        console.error('❌ [TELEFONO] ERROR CRÍTICO:', error);
        console.error('❌ [TELEFONO] Stack:', error.stack);
        
        try {
            await interaction.editReply({
                content: '❌ **Error al procesar el comando.**\nRevisa los logs del servidor.'
            });
        } catch (replyError) {
            console.error('❌ [TELEFONO] No se pudo enviar error:', replyError);
        }
    }
}



// ============================================
// SUBCOMANDO: /telefono colgar
// ============================================
async function handleColgar(interaction, client) {
    await interaction.deferReply();

    const guildId = interaction.guildId;
    const channelId = interaction.channelId;

    if (!global.phoneSystem.guildRooms.has(guildId)) {
        return await interaction.editReply({
            content: '❌ Este servidor no está en ninguna llamada activa.'
        });
    }

    const roomId = global.phoneSystem.guildRooms.get(guildId);
    const room = global.phoneSystem.activeRooms.get(roomId);

    if (!room) {
        global.phoneSystem.guildRooms.delete(guildId);
        return await interaction.editReply({
            content: '❌ Error: Sala no encontrada.'
        });
    }

    room.channels.delete(channelId);
    global.phoneSystem.guildRooms.delete(guildId);

    const leaveEmbed = new EmbedBuilder()
        .setTitle('👋 Servidor Desconectado')
        .setDescription(`**${censorServer(interaction.guild.name)}** ha salido de la llamada.\n\n👥 Quedan **${room.channels.size} servidor(es)** conectados.`)
        .setColor('Orange')
        .setTimestamp();

    for (const cId of room.channels) {
        try {
            const channel = await client.channels.fetch(cId);
            await channel.send({ embeds: [leaveEmbed] });
        } catch (e) {}
    }

    await interaction.editReply({
        content: `✅ **${interaction.user} ha desconectado a ${interaction.guild.name} de la llamada.**`
    });

    if (room.channels.size === 0) {
        if (room.timeout) clearTimeout(room.timeout);
        global.phoneSystem.activeRooms.delete(roomId);
    } else {
        startInactivityTimer(roomId, client);
    }
}

// ============================================
// TIMER DE INACTIVIDAD
// ============================================
function startInactivityTimer(roomId, client) {
    const room = global.phoneSystem.activeRooms.get(roomId);
    if (!room) return;

    if (room.timeout) {
        clearTimeout(room.timeout);
    }

    room.timeout = setTimeout(() => {
        endCall(roomId, client, 'inactividad');
    }, 360000); // 6 minutos
}

// ============================================
// TERMINAR LLAMADA
// ============================================
async function endCall(roomId, client, reason = 'manual') {
    const room = global.phoneSystem.activeRooms.get(roomId);
    if (!room) return;

    if (room.timeout) clearTimeout(room.timeout);

    const endEmbed = new EmbedBuilder()
        .setTitle('📞 Llamada Terminada')
        .setDescription(
            reason === 'inactividad' 
                ? '⏱️ La llamada se cerró por **inactividad** (6 minutos sin mensajes).'
                : '👋 La llamada ha sido **finalizada**.'
        )
        .setColor('Red')
        .setTimestamp();

    for (const channelId of room.channels) {
        try {
            const channel = await client.channels.fetch(channelId);
            await channel.send({ embeds: [endEmbed] });
            
            for (const [gId, rId] of global.phoneSystem.guildRooms) {
                if (rId === roomId) {
                    global.phoneSystem.guildRooms.delete(gId);
                }
            }
        } catch (e) {}
    }

    global.phoneSystem.activeRooms.delete(roomId);
}

module.exports.startInactivityTimer = startInactivityTimer;
module.exports.endCall = endCall;
module.exports.getRandomAvatar = getRandomAvatar;
module.exports.getAvatarAttachment = getAvatarAttachment;
module.exports.censorNick = censorNick;
module.exports.censorServer = censorServer;
