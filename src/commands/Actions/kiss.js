const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')

module.exports = {
    data:new SlashCommandBuilder()
    .setName('kiss')
    .setDescription('Reaccion')
    .addUserOption(option => option
        .setName('user')
        .setDescription('selecciona un usuario.')
        .setRequired(true)),
    async execute(interaction, client)  {

    const choice = [
        "https://media.tenor.com/aGLziaDp4hYAAAAC/asuka-shinji.gif",
        "https://24.media.tumblr.com/eef9fe10e86372fd1e53d747382a3719/tumblr_mmhm8oZl7N1s645eto1_500.gif",
        "https://i.pinimg.com/originals/4d/57/dd/4d57ddcd53675e89ca39fd06356f3042.gif",
        "https://media.tenor.com/MHKrns3xfzgAAAAC/shinji-misato.gif",
        "https://media.tenor.com/zXLSCFCE-fAAAAAd/kiss.gif",
        "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/edf63ba9-c4c7-4835-bc98-10dd23f4a17c/dc82maf-75f45d2d-91ff-4dd7-8d89-25fc276d8c1b.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2VkZjYzYmE5LWM0YzctNDgzNS1iYzk4LTEwZGQyM2Y0YTE3Y1wvZGM4Mm1hZi03NWY0NWQyZC05MWZmLTRkZDctOGQ4OS0yNWZjMjc2ZDhjMWIuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.zQK1sozljRR3LQXu27wEIetuiwWsH8OzHmO3oeWSADM"];
    var ran = Math.floor(Math.random()*choice.length);;
    await interaction.deferReply()

    var answer = "Evaships le da un beso a " + interaction.user.username;
    if(interaction.options.getUser('user') !== null){
        var theUser = await interaction.options.getUser('user');
        answer = interaction.user.username + " le da un beso a " + theUser.username + "!";

        if(interaction.user.username === theUser.username){
            answer = "Evaships le da un beso a " + interaction.user.username;
        }
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