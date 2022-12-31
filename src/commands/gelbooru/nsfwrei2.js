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
    .setName('nsfwrei2')
    .setDescription('Imagen nsfw de rei (Questionable)')
    .addStringOption(option => option
        .setName('sort')
        .setDescription('sort')
        .setRequired(true)
        .addChoices(
                    { name: 'Random', value: 'sort:random' },
                    { name: 'Score', value: 'sort:score' },
                    { name: 'newest', value: 'sort:id:desc' },
                    { name: 'oldest', value: 'sort:id:asc' },
                )),
    async execute(interaction, client)  {
        var linkId = "";
        let tags="ayanami_rei rating:questionable 1girl -1boy -2boys -multiple_boys -interracial -defeat -mass_production_eva -bestiality -futanari -bdsm";
        let date1;
        let linkImg = "";
        
        if(!interaction.channel.nsfw){ 
            interaction.reply({content: "Este comando sólo se puede utilizar en los canales marcados como nsfw.", ephemeral:true}); 
            return; 
        }
        
        let sort = interaction.options.getString('sort');
        tags = tags + " " + sort; 
        await interaction.deferReply();

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
            await GelbooruClient.getPosts(tags, 50, 0).then(post => { // get random post
                console.log("length: "+ post.length)
                for(i = 0; i <= (post.length-1); i++){
               
                   listaGel.add(new lista(post[i].id,new Date(""+post[i].created_at),post[i].file_url))
                    console.log(i);
                }
               }); 
    
            
           }catch(error) {
               console.log(error);
             }
             

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
          .setTitle("REI")
         .setColor("Random")
         .setTimestamp(listaGel.get(0).date)
         .setDescription("https://gelbooru.com/index.php?page=post&s=view&id="+listaGel.get(0).id)
         .setImage(listaGel.get(0).link)
         .setFooter({ text:(buttonstatus + 1) + "/" + (maxStatus + 1)})

        let response;
  
        response = await interaction.followUp({ embeds: [imgasushin], components: [button]});
  

        


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
                .setTitle("REI")
                .setColor("Random")
                .setTimestamp(listaGel.get(buttonstatus).date)
                .setDescription("https://gelbooru.com/index.php?page=post&s=view&id="+listaGel.get(buttonstatus).id)
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
                .setTitle("REI")
                .setColor("Random")
                .setTimestamp(listaGel.get(buttonstatus).date)
                .setDescription("https://gelbooru.com/index.php?page=post&s=view&id="+listaGel.get(buttonstatus).id)
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