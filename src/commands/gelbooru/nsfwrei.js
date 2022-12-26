const Gelbooru  = require('gelbooru-api')
const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder, Client } = require('discord.js')

module.exports = {

    data:new SlashCommandBuilder()
    .setName('nsfwrei')
    .setDescription('Imagen nsfw de rei (Explicit)'),
    async execute(interaction, client)  {
        var linkId = "";
        let tags="ayanami_rei  rating:explicit 1girl -1boy -2boys -multiple_boys -interracial -defeat -mass_production_eva -multitasking -injury -futanari sort:random -bdsm -bestiality";
        let date1;
        let linkImg = "";

        if(!interaction.channel.nsfw){ 
            interaction.reply({content: "Este comando sólo se puede utilizar en los canales marcados como nsfw.", ephemeral:true}); 
            return; 
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

             let imgasurei = new EmbedBuilder()
                   .setTitle("REI")
                  .setColor("Random")
                  .setTimestamp(date1)
                  .setDescription("https://gelbooru.com/index.php?page=post&s=view&id="+linkId)
                  .setImage(linkImg)
                  .setFooter({ text:"SukiBot"})
         
             interaction.followUp({ embeds: [imgasurei] })
         
             },
         }