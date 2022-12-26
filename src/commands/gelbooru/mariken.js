const Gelbooru  = require('gelbooru-api')
const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder, Client } = require('discord.js')

module.exports = {

    data:new SlashCommandBuilder()
    .setName('mariken')
    .setDescription('Imagen casual mariken'),
    async execute(interaction, client)  {

        var linkId = "";
        let tags="makinami_mari_illustrious aida_kensuke -ikari_shinji -asuka_langley_souryuu  -rating:questionable -rating:explicit sort:random";
        let date1;
        let linkImg = "";

        if(interaction.channel.nsfw){ 
            tags = "makinami_mari_illustrious aida_kensuke -ikari_shinji -asuka_langley_souryuu  -rating:general -rating:sensitive";
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
                   .setTitle("MARIKEN")
                  .setColor("Random")
                  .setTimestamp(date1)
                  .setDescription("https://gelbooru.com/index.php?page=post&s=view&id="+linkId)
                  .setThumbnail("https://makesweet.com/f/4/7/c/47c7abf5-07af-4978-9751-3f37716ee319.gif")
                  .setImage(linkImg)
                  .setFooter({ text:"SukiBot"})
         
             interaction.followUp({ embeds: [imgmarishin] })
         
             },
         }