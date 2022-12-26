const Gelbooru  = require('gelbooru-api')
const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder, Client } = require('discord.js')

module.exports = {

    data:new SlashCommandBuilder()
    .setName('search')
    .setDescription('Imagen random de gelbooru)')
    .addStringOption(option => option
        .setName('newtags')
        .setDescription('Tags de Gelbooru')
        .setRequired(true)),
    async execute(interaction, client)  {
        var linkId = "";
        let tags = interaction.options.getString('newtags');
        var str = "I have a cat, a dog, and a goat.";
        var mapObj = {
            shinji:"ikari_shinji",
            asuka:"asuka_langley_souryuu",
            rei:"ayanami_rei"
            };
            tags = tags.replace(/shinji|asuka|rei/gi, function(matched){
            return mapObj[matched];
            });
        let date1;
        let linkImg = "";
        let verifynsfw = false;
        
       GelbooruClient = new Gelbooru(tags);

        
        try {
            await GelbooruClient.getRandomPost(tags, 10, 0).then(post => { // get random post
                  linkId = (""+post.id); // print post id
                  linkImg = (""+post.file_url);
                   date1 = new Date(""+post.created_at);
                   if(post.rating == 'explicit' || post.rating == 'questionable'){
                    verifynsfw = true;
                   }
               }); 
            
            
           }catch(error) {
               console.log(error);
               interaction.reply({content: "Esta imagen contiene contenido nsfw (usa el tag rating:(general o sensitive)", ephemeral:true}); 
                return; 
             }


            if(!interaction.channel.nsfw && verifynsfw){ 
                interaction.reply({content: "Esta imagen contiene contenido nsfw (usa el tag rating:(general o sensitive)", ephemeral:true}); 
                return; 
            }

            try{
             await interaction.deferReply()
            
             let imgasurei = new EmbedBuilder()
                   .setTitle("Search")
                  .setColor("Random")
                  .setTimestamp(date1)
                  .setDescription("https://gelbooru.com/index.php?page=post&s=view&id="+linkId)
                  .setImage(linkImg)
                  .setFooter({ text:"SukiBot"})
         
             interaction.followUp({ embeds: [imgasurei] })
            }catch(error) {
                console.log(error);
                interaction.followUp({content: "Error", ephemeral:true});
                 return; 
              }
             },

         }