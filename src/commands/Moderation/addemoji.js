const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addemoji')
        .setDescription('Carga un nuevo emoji en el servidor')
        // Restringe el comando a quienes tengan permiso para gestionar expresiones
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('Nombre del emoji (2-32 caracteres: letras, números y _)')
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(32)
        )
        .addAttachmentOption(option =>
            option.setName('archivo')
                .setDescription('Imagen a cargar (PNG, JPG, WEBP, GIF - Máximo 256 KB)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('url')
                .setDescription('Alternativamente, ingresa el enlace directo a la imagen')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        // 1. Verificación de permisos del usuario
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
            return interaction.editReply('❌ No tienes el permiso **Gestionar expresiones** para añadir emojis.');
        }

        // 2. Verificación de permisos del bot
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
            return interaction.editReply('❌ El bot no cuenta con el permiso **Gestionar expresiones** en este servidor.');
        }

        // 3. Validación del nombre (Discord solo permite caracteres alfanuméricos y guiones bajos)
        const rawName = interaction.options.getString('nombre');
        const cleanName = rawName.replace(/[^a-zA-Z0-9_]/g, '');

        if (cleanName.length < 2 || cleanName.length > 32) {
            return interaction.editReply('❌ El nombre del emoji debe tener entre 2 y 32 caracteres válidos (solo letras, números o `_`).');
        }

        // 4. Obtención del origen de la imagen (archivo adjunto o URL)
        const attachment = interaction.options.getAttachment('archivo');
        const urlOption = interaction.options.getString('url');
        const imageSource = attachment ? attachment.url : urlOption;

        if (!imageSource) {
            return interaction.editReply('❌ Debes adjuntar un archivo o proporcionar un enlace URL válido.');
        }

        // 5. Control del límite de tamaño de Discord (256 KB)
        if (attachment && attachment.size > 256 * 1024) {
            return interaction.editReply(`❌ El archivo supera el límite de **256 KB** permitido por Discord (Tamaño: ${(attachment.size / 1024).toFixed(1)} KB).`);
        }

        try {
            const emoji = await interaction.guild.emojis.create({
                attachment: imageSource,
                name: cleanName
            });

            const embed = new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('✅ ¡Emoji Añadido!')
                .setDescription(`El emoji ${emoji} (\`:${emoji.name}:\`) fue cargado exitosamente por ${interaction.user}.`)
                .setThumbnail(emoji.url)
                .setFooter({ text: `ID: ${emoji.id}` });

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error al crear emoji:', error);

            if (error.code === 30008) {
                return interaction.editReply('❌ El servidor ha alcanzado el límite máximo de ranuras de emojis.');
            }
            if (error.code === 50035) {
                return interaction.editReply('❌ El archivo o enlace proporcionado no tiene un formato válido para Discord.');
            }

            return interaction.editReply(`❌ No se pudo añadir el emoji: \`${error.message}\``);
        }
    }
};