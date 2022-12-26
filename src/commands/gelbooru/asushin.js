const Gelbooru  = require('gelbooru-api')
const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js')

module.exports = {

    data:new SlashCommandBuilder()
    .setName('asushin')
    .setDescription('Imagen casual asushin'),
    async execute(interaction, client)  {
        var linkId = "";
        var date1;
        let tags="-nagisa_kaworu ikari_shinji asuka_langley_souryuu -rating:explicit -rating:questionable -futanari -yaoi -bisexual_male -2boys -multiple_boys -pegging -yuri -2girls -multiple_girls -netorare -nude sort:random";
        let linkImg = "";
        if(interaction.channel.nsfw){ 
            tags = "-nagisa_kaworu ikari_shinji asuka_langley_souryuu -rating:explicit -rating:questionable -futanari -yaoi -bisexual_male -2boys -multiple_boys -pegging -yuri -2girls -multiple_girls -netorare -nude sort:random -ayanami_rei -solo -violence -domestic_violence -katsuragi_misato -suzuhara_sakura ";
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

    let imgasushin = new EmbedBuilder()
          .setTitle("ASUSHIN")
         .setColor("Random")
         .setTimestamp(date1)
         .setDescription("https://gelbooru.com/index.php?page=post&s=view&id="+linkId)
         .setThumbnail("https://i.pinimg.com/originals/b4/14/b2/b414b2bd9e576927ee225006f67a0f20.gif")
         .setImage(linkImg)
         .setFooter({ text:"SukiBot"})

    interaction.followUp({ embeds: [imgasushin] })

    },
}
    
       /*
    if (interaction.commandName === 'nsfwasushin') {
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('Asushin')
					.setLabel('Asushin!')
					.setStyle(ButtonStyle.Primary),
                    
                    new ButtonBuilder()
					.setCustomId('Kaworei')
					.setLabel('Kaworei!')
					.setStyle(ButtonStyle.Primary),
                    
                    new ButtonBuilder()
					.setCustomId('Asurei')
					.setLabel('Asurei!')
					.setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
					.setCustomId('Misakaji')
					.setLabel('Misakaji!')
					.setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
					.setCustomId('Marishin')
					.setLabel('Marishin!')
					.setStyle(ButtonStyle.Primary),
                    


			);

		await interaction.reply({ content: 'I think you should,', components: [row] });
	}
    */

