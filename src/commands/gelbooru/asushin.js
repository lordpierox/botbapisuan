const Gelbooru  = require('gelbooru-api')
const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js')
const ArrayList = require('arraylist');

function lista(id, date, link) {
    this.id = id;
    this.date = date;
    this.link = link;
  }

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
/*
        try {
         await GelbooruClient.getRandomPost(tags, 10, 0).then(post => { // get random post
               linkId = (""+post.id); // print post id
               linkImg = (""+post.file_url);
                date1 = new Date(""+post.created_at);
                
            }); 
 
         
        }catch(error) {
            console.log(error);
          }
*/
          let listaGel = new ArrayList();
          try {
            await GelbooruClient.getPosts(tags, 40, 0).then(post => { // get random post
                console.log("length: "+ post.length)
                for(i = 0; i <= (post.length-1); i++){
               
                   listaGel.add(new lista(post[i].id,new Date(""+post[i].created_at),post[i].file_url))
                    console.log(i);
                }
               }); 
    
            
           }catch(error) {
               console.log(error);
             }
             console.log(listaGel);

    //await interaction.deferReply()

    

    //interaction.followUp({ embeds: [imgasushin] })

    const button = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('prev')
            .setEmoji('1058459675592511498')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('next')
            .setEmoji('1058459696090062988')
            .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
            .setCustomId('exit')
            .setEmoji('1058459713899081809')
            .setStyle(ButtonStyle.Danger),
);

let buttonstatus = 0;
let maxStatus = (listaGel.length - 1) ;


let imgasushin = new EmbedBuilder()
          .setTitle("ASUSHIN")
         .setColor("Random")
         .setTimestamp(listaGel.get(0).date)
         .setDescription("https://gelbooru.com/index.php?page=post&s=view&id="+listaGel.get(0).id)
         .setThumbnail("https://i.pinimg.com/originals/b4/14/b2/b414b2bd9e576927ee225006f67a0f20.gif")
         .setImage(listaGel.get(0).link)
         .setFooter({ text:(buttonstatus + 1) + "/" + (maxStatus + 1)})

let response;
        //if(listaGel.length == 1){
        //    response = await interaction.reply({ embeds: [imgasushin]});
        //    return;
        //}else{
            response = await interaction.reply({ embeds: [imgasushin], components: [button]});
       // }

        


        const collector = await response.createMessageComponentCollector();

		collector.on('collect', async i => {
            try{
			if(i.customId === 'next') {
				if (i.user.id !== interaction.user.id){
					return await i.reply({content: `Solo ${interaction.user.tag} puede usar el comando`, ephemeral:true});
				}
				
                buttonstatus++;
                if(buttonstatus > maxStatus){
                    buttonstatus = 0;
                }

                let newEmbed = new EmbedBuilder()
                .setTitle("ASUSHIN")
                .setColor("Random")
                .setTimestamp(listaGel.get(buttonstatus).date)
                .setDescription("https://gelbooru.com/index.php?page=post&s=view&id="+listaGel.get(buttonstatus).id)
                .setThumbnail("https://i.pinimg.com/originals/b4/14/b2/b414b2bd9e576927ee225006f67a0f20.gif")
                .setImage(listaGel.get(buttonstatus).link)
                .setFooter({ text:(buttonstatus + 1) + "/" + (maxStatus + 1)})

                return await i.update({ embeds: [newEmbed], components: [button] })
                
			}

			if(i.customId === 'prev') {
				if (i.user.id !== interaction.user.id){
					return await i.reply({content: `Solo ${interaction.user.tag} puede usar el comando`, ephemeral:true});
				}
				
                buttonstatus--;
                if(buttonstatus < 0){
                    buttonstatus = maxStatus;
                }
               
                let newEmbed = new EmbedBuilder()
                .setTitle("ASUSHIN")
                .setColor("Random")
                .setTimestamp(listaGel.get(buttonstatus).date)
                .setDescription("https://gelbooru.com/index.php?page=post&s=view&id="+listaGel.get(buttonstatus).id)
                .setThumbnail("https://i.pinimg.com/originals/b4/14/b2/b414b2bd9e576927ee225006f67a0f20.gif")
                .setImage(listaGel.get(buttonstatus).link)
                .setFooter({ text:(buttonstatus + 1) + "/" + (maxStatus + 1)})

                return await i.update({ embeds: [newEmbed], components: [button] })

			}
         
            if(i.customId === 'exit') {
				if (i.user.id !== interaction.user.id){
					return await i.reply({content: `Solo ${interaction.user.tag} puede usar el comando`, ephemeral:true});
				}

                return await i.message.delete();

            }
        }catch(error){
            console.log(error);
        }
        })


    },
}