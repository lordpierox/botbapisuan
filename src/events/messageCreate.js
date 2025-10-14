const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, ActivityType } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    on: true,
    async execute(message, client) {  // ✅ ORDEN CORRECTO: message primero, luego client
        try {
            // ============================================
            // LÓGICA BUMP (Tu código existente)
            // ============================================
            if (message.type == 20 && message.channel.id == "1032780435425603614" && message.interaction?.commandName == "bump") {
                console.log("bump detectado");
                var member;
                const guild = message.guild;  // ✅ message.guild, no message.guilds.cache.get()
                
                await guild.members.cache.forEach(m => {
                    m.roles.remove("1075621882591715419").catch(() => {});
                });
                
                member = await guild.members.cache.get(message.interaction.user.id);
                const channel = message.channel;  // ✅ message.channel directo
                
                if (!member) {
                    await channel.send("Lilim no encontrado dx.");
                } else {
                    console.log(member);
                    setTimeout(() => member.roles.add("1075621882591715419"), 8000);
                    setTimeout(() => member.roles.remove("1075621882591715419"), 7200000);
                }
            }

            // ============================================
            // SISTEMA DE TELÉFONO - Relay de Mensajes
            // ============================================
            if (global.phoneSystem && global.phoneSystem.activeConnections.has(message.channel.id)) {
                // Ignorar mensajes del bot
                if (message.author.bot) return;

                const connection = global.phoneSystem.activeConnections.get(message.channel.id);
                const partnerChannelId = connection.partnerId;

                try {
                    const partnerChannel = await client.channels.fetch(partnerChannelId);

                    // Crear embed con el mensaje
                    const messageEmbed = new EmbedBuilder()
                        .setAuthor({ 
                            name: `Anónimo`, 
                            iconURL: message.author.displayAvatarURL() 
                        })
                        .setDescription(message.content || '*[mensaje vacío]*')
                        .setColor('Blue')
                        .setTimestamp();

                    // Si tiene imágenes/archivos, añadirlos
                    if (message.attachments.size > 0) {
                        const attachment = message.attachments.first();
                        if (attachment.contentType?.startsWith('image/')) {
                            messageEmbed.setImage(attachment.url);
                        }
                    }

                    await partnerChannel.send({ embeds: [messageEmbed] });

                    // Actualizar timestamp de actividad y reiniciar timer
                    connection.lastActivity = Date.now();
                    const { startInactivityTimer } = require('/../commands/community/telefono');
                    startInactivityTimer(message.channel.id, client);
                    startInactivityTimer(partnerChannelId, client);

                } catch (error) {
                    console.error('Error enviando mensaje telefónico:', error);
                }
            }

        } catch (error) {
            console.log('Error en messageCreate:', error);
        }
    },
};