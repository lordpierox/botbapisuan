const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')

module.exports = {
    data:new SlashCommandBuilder()
    .setName('acto hug abrazar')
    .setDescription('Reaccion')
    .addUserOption(option => option
        .setName('user')
        .setDescription('selecciona un usuario.')
        .setRequired(true)),
    async execute(interaction, client)  {

    const choice = [
    "https://media.tenor.com/6JWa6o9OPUYAAAAC/evangelion-ritsuko.gif",
    "https://64.media.tumblr.com/26839740ac3c4f46d1e690c5ac8eab45/9443e9f0cf049bc9-97/s540x810/cb85a038597a612e0fe6b0759b2c070a9472824b.gif"];
    var ran = Math.floor(Math.random()*choice.length);;
    await interaction.deferReply()

    var theUser = await interaction.options.getUser('user');
    var answer = interaction.user.username + " abraza a " + theUser.username + "!";

    if(interaction.user.username === theUser.username){
        answer = "Evaships abraza a " + interaction.user.username;
    }
        console.log("numero di choice: "+ choice[ran]);
    let bite = new EmbedBuilder()
         
         .setDescription(answer)
         .setColor("Random")
         .setTimestamp()
         .setImage(choice[ran])
         .setFooter({ text:"SukiBot"});
        
    interaction.followUp({ embeds: [bite] })
    },
}