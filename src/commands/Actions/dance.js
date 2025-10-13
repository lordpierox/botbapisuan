const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')

module.exports = {
    data:new SlashCommandBuilder()
    .setName('acto dance bailar')
    .setDescription('Reaccion'),
    async execute(interaction, client)  {

    const choice = [
        "https://media.tenor.com/msUe1bigvaEAAAAC/evangelion-shinji-ikari.gif",
        "https://media.tenor.com/kZo8jyxABlYAAAAC/evangelion-dancing.gif",
        "https://media.tenor.com/5hrI54nrHqMAAAAd/neon-genesis-evangelion-shinji-ikari.gif",
        "https://gfycat.com/cheerfulinfamouslabradorretriever-evangelion",
        "https://64.media.tumblr.com/ded0c27483f6970240e6fa944f78acaa/tumblr_inline_p912ofCloB1qkpgz6_500.gifv",
        "https://media.tenor.com/FgGlem7vDJMAAAAd/evangelion-pubg.gif",
        "https://media.tenor.com/H-Hm-zXBRxUAAAAM/pubg-pubg-mobile.gif",
        "https://imgflip.com/gif/1fm55e",
        "https://media.tenor.com/-iQRugZFJt0AAAAd/evangelion-neon-genesis-evangelion.gif",
        "https://media.tenor.com/y6M-MOCmj4MAAAAC/get-real-rei-ayanami.gif",
        "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/f3c90f76-a724-4466-b662-cb7ec7d9c2b3/d4wggn6-339d3573-538d-4efc-a316-f3223f7eb5e7.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2YzYzkwZjc2LWE3MjQtNDQ2Ni1iNjYyLWNiN2VjN2Q5YzJiM1wvZDR3Z2duNi0zMzlkMzU3My01MzhkLTRlZmMtYTMxNi1mMzIyM2Y3ZWI1ZTcuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.QFOV6I3NliadpKlMwcIYm7eF5xnTEroHtJSyX8lBXPU",
        "https://media.tenor.com/7WRxkembPzcAAAAC/misato-evangelion.gif",
        "https://media.tenor.com/kZo8jyxABlYAAAAC/evangelion-dancing.gif",
        "https://media.tenor.com/CY5gvldryLcAAAAd/neon-genesis-evangelion-rei.gif"];
    var ran = Math.floor(Math.random()*choice.length);;
    await interaction.deferReply()

    var answer = " inicia a bailar.";
    
        console.log("numero di choice: "+ choice[ran]);
    let dance = new EmbedBuilder()
         
         .setDescription(interaction.user.username + answer)
         .setColor("Random")
         .setTimestamp()
         .setImage(choice[ran])
         .setFooter({ text:"SukiBot"});
        
    interaction.followUp({ embeds: [dance] })
    },
}