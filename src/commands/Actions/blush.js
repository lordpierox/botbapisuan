const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')

module.exports = {
    data:new SlashCommandBuilder()
    .setName('blush')
    .setDescription('Reaccion'),
    async execute(interaction, client)  {

    const choice = [
    "https://i.pinimg.com/originals/e8/7c/88/e87c887e660a492565cc06fd89cc7ce4.gif",
    "https://media.tenor.com/57ykwUGXE08AAAAC/blush-shinji.gif",
    "https://media.tenor.com/hwZEAai1BgsAAAAd/asuka-asuka-langley.gif",
    "https://i.pinimg.com/originals/06/92/2d/06922d5fc663c338c260378fb73affc5.gif",
    "https://i.kym-cdn.com/photos/images/original/001/127/013/562.gif",
    "https://pa1.narvii.com/7517/71f5a324c8c7c9d34137471bd370ba9e252c5b33r1-500-281_hq.gif"];
    var ran = Math.floor(Math.random()*choice.length);;
    await interaction.deferReply()

    var answer = " se sonroja.";
    
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