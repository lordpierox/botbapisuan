const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')

module.exports = {
    data:new SlashCommandBuilder()
    .setName('bite')
    .setDescription('Reaccion')
    .addUserOption(option => option
        .setName('user')
        .setDescription('selecciona un usuario.')
        .setRequired(true)),
    async execute(interaction, client)  {

    const choice = [
    "https://68.media.tumblr.com/2e8c7a5ed5c9b79f244881a5a0c0ef0d/tumblr_o0t4wfzRd01v39f3co1_500.gif",
    "https://64.media.tumblr.com/e69d4a9b89ca5a3c5adbfd520ed6bc21/9d321703d3c16096-a5/s500x750/5e670fee7ca2b0e98627776a6aa73ff0e9c727f8.gif",
    "https://media.tenor.com/KNFoNwqzJj0AAAAC/evangelion-rebuild-of-evangelion.gif",
    "https://64.media.tumblr.com/3474f4b3f108bf7a5d74418dc9b1bfdd/tumblr_mt1nb4wR2e1rey868o1_500.gif"];
    var ran = Math.floor(Math.random()*choice.length);;
    await interaction.deferReply()

    var theUser = await interaction.options.getUser('user');
    var answer = interaction.user.username + " muerde a " + theUser.username + "!";

    if(interaction.user.username === theUser.username){
        answer = "Evaships muerde a " + interaction.user.username;
    }


        console.log("numero di choice: "+ choice[ran]);
    let kiss = new EmbedBuilder()
         
         .setDescription(answer)
         .setColor("Random")
         .setTimestamp()
         .setImage(choice[ran])
         .setFooter({ text:"SukiBot"});
        
    interaction.followUp({ embeds: [kiss] })
    },
}