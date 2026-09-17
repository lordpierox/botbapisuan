const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ob')
        .setDescription('Obtiene enlaces de invitación de los servidores del bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const invites = [];

        for (const [guildId, guild] of client.guilds.cache) {
            // Buscar el primer canal compatible que permita invitaciones
            const channel = guild.channels.cache.find(ch => 
                typeof ch.createInvite === 'function' &&
                ch.type !== ChannelType.GuildCategory &&
                ch.permissionsFor(guild.members.me)?.has(PermissionFlagsBits.CreateInstantInvite)
            );

            if (channel) {
                try {
                    const invite = await channel.createInvite({
                        maxAge: 86400, // 24 horas (usa 0 para permanente)
                        maxUses: 1,    // 1 uso (usa 0 para ilimitado)
                        unique: true
                    });
                    invites.push(`**${guild.name}**: ${invite.url}`);
                } catch (err) {
                    invites.push(`**${guild.name}**: Error al generar (${err.message})`);
                }
            } else {
                invites.push(`**${guild.name}**: Sin permisos de invitación o sin canal válido`);
            }
        }

        const responseText = invites.join('\n');
        
        // Controlar el límite de 2000 caracteres de Discord
        if (responseText.length > 2000) {
            await interaction.editReply({ 
                content: responseText.slice(0, 1990) + '...' 
            });
        } else {
            await interaction.editReply({ 
                content: responseText || 'No se encontraron servidores.' 
            });
        }
    }
};