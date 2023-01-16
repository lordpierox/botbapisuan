const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Pong! Muestra la latencia del bot.'),
    async execute(interaction, client) {
      await interaction.deferReply()
      
         
        let ping = new EmbedBuilder()
         .setDescription(`:ping_pong: Pong! Latencia: **${client.ws.ping} ms**`)
         .setColor("Random")
         .setTimestamp()

          interaction.followUp({ embeds: [ping] })
    }
    }
    