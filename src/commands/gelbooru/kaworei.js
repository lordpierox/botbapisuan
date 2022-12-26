const Gelbooru  = require('gelbooru-api')
const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder, Client } = require('discord.js')

module.exports = {

    data:new SlashCommandBuilder()
    .setName('kaworei')
    .setDescription('Imagen casual kaworei'),
    async execute(interaction, client)  {

        var linkId = "";
        let tags="nagisa_kaworu ayanami_rei -rating:explicit  -futanari -2boys -yaoi -multiple_girls -multiple_boys -meme -squirrel -solo sort:random";
        let date1;
        let linkImg = "";

        if(interaction.channel.nsfw){ 
            tags = "nagisa_kaworu ayanami_rei rating:explicit  -futanari -2boys sort:random";
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

             let imgkaworei = new EmbedBuilder()
                   .setTitle("KAWOREI")
                  .setColor("Random")
                  .setTimestamp(date1)
                  .setDescription("https://gelbooru.com/index.php?page=post&s=view&id="+linkId)
                  .setThumbnail("https://giffiles.alphacoders.com/112/112935.gif")
                  .setImage(linkImg)
                  .setFooter({ text:"SukiBot"})
         
             interaction.followUp({ embeds: [imgkaworei] })
         
             },
         }