const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, ActivityType } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    on: true,
    async execute(client, message, messageCreate) {
        try {
            // ============================================
            // LÓGICA BUMP (Tu código existente)
            // ============================================
            if (client.type == 20 && client.channel.id == "1032780435425603614" && client.interaction.commandName == "bump") {
                console.log("bump detectado");
                var member;
                const guild = await message.guilds.cache.get(client.guildId);
                
                await guild.members.cache.forEach(member => {
                    member.roles.remove("1075621882591715419");
                });
                
                member = await guild.members.cache.get(client.interaction.user.id);
                const channel = await client.channel;
                
                if (member == null || member == undefined) {
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
                        messageEmbed.setImage(attachment.url);
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
            console.log(error);
        }
    },
};
