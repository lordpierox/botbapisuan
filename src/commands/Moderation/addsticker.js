const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addsticker')
        .setDescription('Carga una nueva pegatina (sticker) en el servidor')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('Nombre del sticker (2-30 caracteres)')
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(30)
        )
        .addStringOption(option =>
            option.setName('tag')
                .setDescription('Emoji de Discord relacionado (ejemplo: 😀 o :fire:)')
                .setRequired(true)
        )
        .addAttachmentOption(option =>
            option.setName('archivo')
                .setDescription('Archivo PNG o APNG (Resolución exacta: 320x320 px, máx. 512 KB)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('descripcion')
                .setDescription('Descripción de accesibilidad (opcional, máx. 100 caracteres)')
                .setMaxLength(100)
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        // 1. Verificación de permisos del usuario
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
            return interaction.editReply('❌ No tienes el permiso **Gestionar expresiones** para añadir stickers.');
        }

        // 2. Verificación de permisos del bot
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
            return interaction.editReply('❌ El bot no cuenta con el permiso **Gestionar expresiones** en este servidor.');
        }

        const name = interaction.options.getString('nombre');
        const tag = interaction.options.getString('tag');
        const description = interaction.options.getString('descripcion') || '';
        const attachment = interaction.options.getAttachment('archivo');

        // 3. Control de formato (Discord solo acepta PNG o APNG para stickers de servidor, no GIF convencionales)
        const validMimeTypes = ['image/png', 'image/apng'];
        if (attachment.contentType && !validMimeTypes.includes(attachment.contentType)) {
            return interaction.editReply('❌ Los stickers de servidor solo admiten formato **PNG** o **APNG** (los GIF convencionales no son compatibles).');
        }

        // 4. Control del límite de tamaño de Discord (512 KB)
        if (attachment.size > 512 * 1024) {
            return interaction.editReply(`❌ El archivo supera el límite de **512 KB** permitido por Discord (Tamaño: ${(attachment.size / 1024).toFixed(1)} KB).`);
        }

        try {
            const sticker = await interaction.guild.stickers.create({
                file: attachment.url,
                name: name,
                tags: tag,
                description: description
            });

            const embed = new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('✅ ¡Sticker Añadido!')
                .setDescription(`El sticker **${sticker.name}** fue cargado exitosamente por ${interaction.user}.`)
                .setImage(sticker.url)
                .addFields(
                    { name: 'Emoji Asociado', value: tag, inline: true },
                    { name: 'Descripción', value: description || 'Ninguna', inline: true }
                )
                .setFooter({ text: `ID: ${sticker.id}` });

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error al crear sticker:', error);

            if (error.code === 30039) {
                return interaction.editReply('❌ El servidor ha alcanzado el límite máximo de ranuras de stickers.');
            }
            if (error.message.includes('320') || error.code === 50046) {
                return interaction.editReply('❌ La imagen debe tener dimensiones exactas de **320x320 píxeles**.');
            }

            return interaction.editReply(`❌ No se pudo añadir el sticker: \`${error.message}\``);
        }
    }
};