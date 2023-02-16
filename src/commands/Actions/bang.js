const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')

module.exports = {
    data:new SlashCommandBuilder()
    .setName('bang')
    .setDescription('Reaccion')
    .addUserOption(option => option
        .setName('user')
        .setDescription('selecciona un usuario.')
        .setRequired(false)),
    async execute(interaction, client)  {

    await interaction.deferReply()
    const choice = [
    "https://64.media.tumblr.com/93b3e19a29d61666b131a75016e723c7/tumblr_pgvgpydRfS1vhuamt_500.gifv",
    "https://i.gifer.com/origin/1a/1a1599bca19aada796863bd0cbdc480a.gif",
    "https://thumbs.gfycat.com/DismalVariableGermanshepherd-size_restricted.gif",
    "https://64.media.tumblr.com/332a7dd09db2c7072afa48104db6b521/bfc90afc440ce526-d7/s640x960/d0aeecf80fbfaaf5bc9d89b7021abceddd245285.gif",
    "https://64.media.tumblr.com/9cf679774c28343c49097c284da930d1/tumblr_o9d222IOYM1qjz3kqo1_500.gif",
    "https://gfycat.com/grouchygeneralhyrax",
    "https://i.kym-cdn.com/photos/images/newsfeed/000/706/248/6f8.gif",
    "https://media.tenor.com/l01RAcRu6igAAAAC/nge-neon-genesis-evangelion.gif",
    "https://i.pinimg.com/originals/36/b2/53/36b253ba0a8caa4beca27e807fbe2ae2.gif",
    "https://media.tenor.com/jTn44nuiZDcAAAAC/evangelion-rebuild.gif",
    "https://media.tenor.com/MU-RLMMHPHMAAAAC/misato-katsuragi-reload.gif"];
    var ran = Math.floor(Math.random()*choice.length);;
    

    var answer = "Evaships le dispara a " + interaction.user.username;
    if(interaction.options.getUser('user') !== null){
        var theUser = await interaction.options.getUser('user');
        answer = interaction.user.username + " dispara a " + theUser.username + "!";

        if(interaction.user.username === theUser.username){
            answer = "Evaships le dispara a " + interaction.user.username;
        }
    }
    
        console.log("numero di choice: "+ choice[ran]);
    let bang = new EmbedBuilder()
         
         .setDescription(answer)
         .setColor("Random")
         .setTimestamp()
         .setImage(choice[ran])
         .setFooter({ text:"SukiBot"});
        
    interaction.followUp({ embeds: [bang] })
    },
}