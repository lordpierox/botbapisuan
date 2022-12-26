const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')

module.exports = {
    data:new SlashCommandBuilder()
    .setName('bola8')
    .setDescription('La bola respondera a tu pregunta')
    .addStringOption(option => option.setName('pregunta').setDescription('Escribe aqui.').setRequired(true)),
    async execute(interaction, client)  {

    const choice = ["Es cierto","Como yo lo veo, sí.","Pregunta confusa, vuelve a intentarlo.","No cuentes con ello.","Mi respuesta es no."];
    var ran = Math.floor(Math.random()*choice.length);;
    const answer = interaction.options.get("pregunta").value;
    var largo = choice.length;
    await interaction.deferReply()

    let bola8 = new EmbedBuilder()
         
         .setDescription("**"+interaction.user.username + ":** " + answer + "\n\n:brain:| " + choice[ran])
         .setColor("Random")
         .setTimestamp()
         .setFooter({ text:"SukiBot"})
         .setThumbnail("https://64.media.tumblr.com/4975e10da8bc0596867c0afb6fed4bfa/tumblr_pn354xJICW1vm1a59o1_500.gif");
        
    interaction.followUp({ embeds: [bola8] })
    },
}