const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')

module.exports = {
    data:new SlashCommandBuilder()
    .setName('eating')
    .setDescription('Reaccion'),
    async execute(interaction, client)  {

    const choice = [
    "https://thumbs.gfycat.com/DependentLightAvocet-max-1mb.gif",
    "https://64.media.tumblr.com/f3ce24502dfecf64d8c5361306cf5ac3/tumblr_p4tbeyLc2s1vm1a59o1_540.gif",
    "https://media.tenor.com/L2FMFj3pQ4kAAAAS/misato-misato-katsuragi.gif",
    "https://img.gifmagazine.net/gifmagazine/images/20101/original.gif",
    "https://image.myanimelist.net/ui/BQM6jEZ-UJLgGUuvrNkYUNwLpdhh9mfbwIBB6D1G23zbgms14yy29V5DwtovjcUbbuZmq6la8rwdXQ2f0qTgJA",
    "https://giffiles.alphacoders.com/112/112469.gif",
    "https://64.media.tumblr.com/3feb45c73a5754851fe205363f26d49c/tumblr_mzcftyjOFS1qmjkvvo1_500.gif",
    "https://64.media.tumblr.com/3334dcb27d3b1cc38657ea4ac27439a2/tumblr_mjfj2thpor1rec90to1_500.gif",
    "https://giffiles.alphacoders.com/112/112440.gif",
    "https://thumbs.gfycat.com/OrangeSimilarAchillestang-size_restricted.gif",
    "https://64.media.tumblr.com/245ebfe9ed91870c65a158bcfc6d2c81/tumblr_oix6w12o2S1vart62o1_r9_500.gifv"];
    var ran = Math.floor(Math.random()*choice.length);;
    await interaction.deferReply()

    var answer = " esta comiendo.";
    
        console.log("numero di choice: "+ choice[ran]);
    let blush = new EmbedBuilder()
         
         .setDescription(interaction.user.username + answer)
         .setColor("Random")
         .setTimestamp()
         .setImage(choice[ran])
         .setFooter({ text:"SukiBot"});
        
    interaction.followUp({ embeds: [blush] })
    },
}