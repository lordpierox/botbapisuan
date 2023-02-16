const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')

module.exports = {
    data:new SlashCommandBuilder()
    .setName('confused')
    .setDescription('Reaccion'),
    async execute(interaction, client)  {

    const choice = [
    "https://i.gifer.com/DV6.gif",
    "https://media3.giphy.com/media/ydyZ0KaHpiyGI/giphy.gif?cid=790b761179dbb89bc19c22fc41d350b06547c3b3a64c1c87&rid=giphy.gif&ct=g",
    "https://images.squarespace-cdn.com/content/v1/5bae09a3755be22d4d83355a/1623800205676-1Z67XAT6RPA9GIRO8RBE/public.gif",
    "https://64.media.tumblr.com/bdb8af6c3195112a9878212d656536a2/8bf7fc16bd26eff8-60/s540x810/99e2edbace039ff1c1c25d7e71a7a7915df3cd09.gif",
    "https://64.media.tumblr.com/0cce46e13ffffed5ecb0a20aeda900c6/tumblr_o2abgxG5zC1v39f3co1_500.gif",
    "https://giffiles.alphacoders.com/112/112004.gif",
    "https://otakuorbit.com/wp-content/uploads/2018/06/tumblr_n0j6nvw0pk1s62xp3o1_500.gif"];
    var ran = Math.floor(Math.random()*choice.length);;
    await interaction.deferReply()

    var answer = " se siente confundido/a";
    
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