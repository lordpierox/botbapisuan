const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

if (!global.phoneSystem) {
    global.phoneSystem = {
        waitingQueue: [],
        activeConnections: new Map(),
    };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('telefono')
        .setDescription('Sistema de llamadas entre servidores')
        .addSubcommand(subcommand =>
            subcommand
                .setName('llamar')
                .setDescription('Inicia una llamada con otro servidor'))
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
// SUBCOMANDO: /telefono llamar
// ============================================
async function handleLlamar(interaction, client) {
    await interaction.deferReply();  // ✅ SIN ephemeral - público

    const channelId = interaction.channelId;
    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    // Verificar si ya está en llamada
    if (global.phoneSystem.activeConnections.has(channelId)) {
        return await interaction.editReply({
            content: '📞 **Ya hay una llamada activa en este canal.**\nUsa `/telefono colgar` para terminarla.'
        });
    }

    // Verificar si ya está en cola
    const alreadyWaiting = global.phoneSystem.waitingQueue.find(
        entry => entry.channelId === channelId
    );

    if (alreadyWaiting) {
        return await interaction.editReply({
            content: '⏳ **Ya estás esperando una llamada.**\nEspera a que alguien más use el comando.'
        });
    }

    // Buscar alguien en la cola (diferente servidor)
    const availablePartner = global.phoneSystem.waitingQueue.find(
        entry => entry.guildId !== guildId
    );

    if (availablePartner) {
        // ¡Conexión encontrada!
        global.phoneSystem.waitingQueue = global.phoneSystem.waitingQueue.filter(
            entry => entry.channelId !== availablePartner.channelId
        );

        // Establecer conexión bidireccional
        const connection1 = {
            partnerId: availablePartner.channelId,
            lastActivity: Date.now(),
            timeout: null
        };

        const connection2 = {
            partnerId: channelId,
            lastActivity: Date.now(),
            timeout: null
        };

        global.phoneSystem.activeConnections.set(channelId, connection1);
        global.phoneSystem.activeConnections.set(availablePartner.channelId, connection2);

        // Notificar ambos canales
        const connectEmbed = new EmbedBuilder()
            .setTitle('📞 ¡Llamada Conectada!')
            .setDescription('Se ha establecido una conexión con otro servidor.\n\n**Escribe mensajes normales** y serán enviados al otro lado.\n\n🔴 La llamada se cerrará después de **3 minutos** sin mensajes.\n💬 Usa `/telefono colgar` para terminar la llamada.')
            .setColor('Green')
            .setTimestamp();

        try {
            const channel1 = await client.channels.fetch(channelId);
            const channel2 = await client.channels.fetch(availablePartner.channelId);

            await channel1.send({ embeds: [connectEmbed] });
            await channel2.send({ embeds: [connectEmbed] });

            // ✅ Respuesta PÚBLICA (sin ephemeral)
            await interaction.editReply({
                content: `✅ **¡Llamada establecida con éxito!**\n${interaction.user} ha conectado con otro servidor.`
            });

            // Iniciar timeout de inactividad
            startInactivityTimer(channelId, client);
            startInactivityTimer(availablePartner.channelId, client);

        } catch (error) {
            console.error('Error estableciendo llamada:', error);
            await interaction.editReply('❌ Error al conectar la llamada.');
        }

    } else {
        // Añadir a cola de espera
        const queueEntry = {
            channelId,
            guildId,
            userId,
            timestamp: Date.now()
        };

        global.phoneSystem.waitingQueue.push(queueEntry);

        const waitEmbed = new EmbedBuilder()
            .setTitle('📞 Esperando Llamada...')
            .setDescription(`${interaction.user} está buscando una conexión...\n\n⏳ Esperando hasta **1 minuto** por otra persona.\n\nSi alguien en otro servidor usa \`/telefono llamar\`, la llamada se conectará automáticamente.`)
            .setColor('Orange')
            .setTimestamp();

        // ✅ Respuesta PÚBLICA
        await interaction.editReply({
            embeds: [waitEmbed]
        });

        // Timeout de 1 minuto
        setTimeout(() => {
            const stillWaiting = global.phoneSystem.waitingQueue.find(
                entry => entry.channelId === channelId
            );

            if (stillWaiting) {
                global.phoneSystem.waitingQueue = global.phoneSystem.waitingQueue.filter(
                    entry => entry.channelId !== channelId
                );

                const timeoutEmbed = new EmbedBuilder()
                    .setTitle('⏱️ Tiempo Agotado')
                    .setDescription('No se encontró a nadie disponible.\nIntenta de nuevo más tarde con `/telefono llamar`.')
                    .setColor('Red')
                    .setTimestamp();

                client.channels.fetch(channelId).then(channel => {
                    channel.send({ embeds: [timeoutEmbed] });
                }).catch(() => {});
            }
        }, 60000); // 1 minuto
    }
}

// ============================================
// SUBCOMANDO: /telefono colgar
// ============================================
async function handleColgar(interaction, client) {
    await interaction.deferReply();  // ✅ SIN ephemeral - público

    const channelId = interaction.channelId;

    if (!global.phoneSystem.activeConnections.has(channelId)) {
        return await interaction.editReply({
            content: '❌ No hay ninguna llamada activa en este canal.'
        });
    }

    await endCall(channelId, client, 'manual');

    // ✅ Respuesta PÚBLICA
    await interaction.editReply({
        content: `✅ **${interaction.user} ha finalizado la llamada.**`
    });
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function startInactivityTimer(channelId, client) {
    const connection = global.phoneSystem.activeConnections.get(channelId);
    if (!connection) return;

    if (connection.timeout) {
        clearTimeout(connection.timeout);
    }

    connection.timeout = setTimeout(() => {
        endCall(channelId, client, 'inactividad');
    }, 180000); // 3 minutos
}

async function endCall(channelId, client, reason = 'manual') {
    const connection = global.phoneSystem.activeConnections.get(channelId);
    if (!connection) return;

    const partnerId = connection.partnerId;

    // Limpiar timeouts
    if (connection.timeout) clearTimeout(connection.timeout);
    const partnerConnection = global.phoneSystem.activeConnections.get(partnerId);
    if (partnerConnection && partnerConnection.timeout) {
        clearTimeout(partnerConnection.timeout);
    }

    // Remover conexiones
    global.phoneSystem.activeConnections.delete(channelId);
    global.phoneSystem.activeConnections.delete(partnerId);

    // Notificar ambos canales
    const endEmbed = new EmbedBuilder()
        .setTitle('📞 Llamada Terminada')
        .setDescription(
            reason === 'inactividad' 
                ? '⏱️ La llamada se cerró por **inactividad** (3 minutos sin mensajes).'
                : '👋 La llamada ha sido **finalizada**.'
        )
        .setColor('Red')
        .setTimestamp();

    try {
        const channel1 = await client.channels.fetch(channelId);
        const channel2 = await client.channels.fetch(partnerId);

        await channel1.send({ embeds: [endEmbed] });
        await channel2.send({ embeds: [endEmbed] });
    } catch (error) {
        console.error('Error terminando llamada:', error);
    }
}

// Exportar funciones para messageCreate.js
module.exports.startInactivityTimer = startInactivityTimer;
module.exports.endCall = endCall;
