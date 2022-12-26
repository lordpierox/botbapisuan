const Gelbooru  = require('gelbooru-api')
const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder, Client } = require('discord.js')

module.exports = {

    data:new SlashCommandBuilder()
    .setName('marishin')
    .setDescription('Imagen casual marishin'),
    async execute(interaction, client)  {

        var linkId = "";
        let tags="makinami_mari_illustrious ikari_shinji -rating:questionable -rating:explicit -threesome -yaoi -multiple_girls -multiple_boys -cup -squirrel -trap -eyepatch -balloon -simple_background 1girl sort:random";
        let date1;
        let linkImg = "";

        if(interaction.channel.nsfw){ 
            tags = "makinami_mari_illustrious ikari_shinji rating:explicit -threesome -yaoi sort:random -asuka_langley_souryuu  ";
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

             let imgmarishin = new EmbedBuilder()
                   .setTitle("MARISHIN")
                  .setColor("Random")
                  .setTimestamp(date1)
                  .setDescription("https://gelbooru.com/index.php?page=post&s=view&id="+linkId)
                  .setThumbnail("https://64.media.tumblr.com/5de37bb9c5d9b54a6aa665b4768f6718/tumblr_o0pcmhhpXg1v39f3co2_500.gif")
                  .setImage(linkImg)
                  .setFooter({ text:"SukiBot"})
         
             interaction.followUp({ embeds: [imgmarishin] })
         
             },
         }