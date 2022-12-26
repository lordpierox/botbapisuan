const Gelbooru  = require('gelbooru-api')
const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder, Client } = require('discord.js')

module.exports = {
    
    data:new SlashCommandBuilder()
    .setName('misakaji')
    .setDescription('Imagen casual misakaji'),
    async execute(interaction, client)  {

        var linkId = "";
        let tags="kaji_ryouji katsuragi_misato -rating:explicit -yaoi -futanari -multiple_boys -2girls -ayanami_rei_(cosplay) sort:random";
        let date1;
        let linkImg = "";

        if(interaction.channel.nsfw){ 
            tags = "kaji_ryouji katsuragi_misato rating:explicit -yaoi -futanari -2boys sort:random";
            //interaction.reply({content: "Este comando sólo se puede utilizar en los canales marcados como nsfw.", ephemeral:true}); 
            //return; 
        }

       GelbooruClient = new Gelbooru(tags);

        try {
            await GelbooruClient.getRandomPost(tags, 10, 0).then(post => { // get random post
                  linkId = (""+post.id); // print post id
                  linkImg = (""+post.file_url);
                   date1 = new Date(""+post.created_at);
                   
               }); 
    
            
           }catch(error) {
               console.log(error);
             }




             await interaction.deferReply()

             let imgmisakaji = new EmbedBuilder()
                   .setTitle("MISAKAJI")
                  .setColor("Random")
                  .setTimestamp(date1)
                  .setDescription("https://gelbooru.com/index.php?page=post&s=view&id="+linkId)
                  .setThumbnail("https://64.media.tumblr.com/20766e7013862cc72e2096f014883a8c/tumblr_mi8b8jGyLt1riyvejo1_500.gif")
                  .setImage(linkImg)
                  .setFooter({ text:"SukiBot"})
         
             interaction.followUp({ embeds: [imgmisakaji] })
         
             },
         }