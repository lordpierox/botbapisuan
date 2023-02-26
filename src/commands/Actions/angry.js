const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')

module.exports = {
    data:new SlashCommandBuilder()
    .setName('angry')
    .setDescription('Reaccion')
    .addUserOption(option => option
        .setName('user')
        .setDescription('selecciona un usuario.')
        .setRequired(false)),
    async execute(interaction, client)  {

    await interaction.deferReply()

    const choice = [
    "https://media.tenor.com/Y2NwuJ_RuZIAAAAC/shinji-ikari-shinji.gif",
    "https://media.tenor.com/OadWktdQXl0AAAAC/evangelion-angry.gif",
    "https://media.tenor.com/-Ok1XvetIQUAAAAC/moscato-neon.gif",
    "https://media.tenor.com/M2XAANtkNeoAAAAC/asuka-evangelion.gif",
    "https://media.tenor.com/O8w4yYKhWCIAAAAC/anime.gif",
    "https://media.tenor.com/7kT6AAw-K3wAAAAC/evangelion-misato.gif",
    "https://media.tenor.com/yngIrwQj2MsAAAAC/anime-rage.gif",
    "https://media.tenor.com/L2ppqCMg99kAAAAC/mari-makinami-illustrious-mari.gif",
    "https://media.tenor.com/UPqNQPMCEOQAAAAC/evangelion-asuka.gif",
    "https://media.tenor.com/sOTfKpxJQOoAAAAC/misato-evangelion.gif",
    "https://media.tenor.com/rquDMbEaRCsAAAAS/asuka-angry.gif",
    "https://media.tenor.com/7S638lh4XAUAAAAC/oltokun-otto.gif",
    "https://media.tenor.com/xlsipJ5o_2kAAAAC/on-my-nerves-neon-genesis-evangelion.gif",
    "https://media.tenor.com/tqo9zwSxJRkAAAAC/neon-genesis-evangelion-evangelion.gif",
    "https://64.media.tumblr.com/57c366b62a42842b48dc288ac1b1e44e/tumblr_ptr8s8Br6i1xkr0iao1_540.gif",
    "https://media.tenor.com/s6uhUeJMgCAAAAAC/asuka-asuka-langley.gif",
    "https://media.tenor.com/HvUawMRmLHkAAAAC/kill-asuka.gif",
    "https://giffiles.alphacoders.com/112/112079.gif",
    "https://64.media.tumblr.com/5a60e7665ea22814ebe591d1d5543065/tumblr_mnbsvuWMvr1qjhmoto1_500.gif",
    "https://64.media.tumblr.com/fa9126cef8d52a8e41c43cc598a48239/801cac7ecbd174c3-c4/s540x810/b52520b095a0e488a3fdd25a1fc2b0f54a12c286.gif",
    "https://media.tenor.com/GYD_DkhKadkAAAAC/asuka.gif"];

    var ran = Math.floor(Math.random()*choice.length);;
    var answer = " está enfadado!";
   
    if(interaction.options.getUser('user') !== null){
        var theUser = await interaction.options.getUser('user');
        answer = " quiere desatar su ira contra " + theUser.username + "!";
        if(interaction.user.username === theUser.username){
            answer = " quiere desatar su ira contra " + theUser.username + "! (está crazy)";
        }
    }
    let angry = new EmbedBuilder()
         
         .setDescription(interaction.user.username + answer)
         .setColor("Random")
         .setTimestamp()
         .setImage(choice[ran])
         .setFooter({ text:"SukiBot"});
        
    interaction.followUp({ embeds: [angry] })
    },
}