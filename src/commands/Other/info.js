const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data:new SlashCommandBuilder()
        .setName('info')
        .setDescription('News del bot'),
    async execute(interaction, client)  {
        await interaction.reply({ 
            content: `El Bot se esta actualizando`,ephemeral: true})

            
    },
}
