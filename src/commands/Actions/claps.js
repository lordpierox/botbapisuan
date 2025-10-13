const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')

module.exports = {
    data:new SlashCommandBuilder()
    .setName('acto claps aplaudir')
    .setDescription('Reaccion')
    .addUserOption(option => option
        .setName('user')
        .setDescription('selecciona un usuario.')
        .setRequired(true)),
    async execute(interaction, client)  {

    const choice = [
    "https://media.tenor.com/DN4JBeneqdkAAAAM/congratulations-evangelion.gif",
    "https://media.tenor.com/Agw6xn9qKV8AAAAC/asuka-evangelion.gif",
    "https://media.tenor.com/b1nqguJIuf8AAAAC/evangelion-clapping.gif",
    "https://imgur.com/bnBBYyz"];
    var ran = Math.floor(Math.random()*choice.length);;
    await interaction.deferReply()

    var answer = interaction.user.username + " está aplaudiendo!";
    if(interaction.options.getUser('user') !== null){
        var theUser = await interaction.options.getUser('user');
        answer = interaction.user.username + " le aplaude a " + theUser.username + "!";

        if(interaction.user.username === theUser.username){
            answer = interaction.user.username + " se aplaude a si mismo (que egocentrico)";
        }
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