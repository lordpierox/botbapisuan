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
    .setName('search')
    .setDescription('Imagen random de gelbooru')
    .addStringOption(option => option
        .setName('tags')
        .setDescription('tags example: asuka shinji -kaworu hug happy')
        .setRequired(true))
    .addStringOption(option => option
        .setName('rating')
        .setDescription('rating')
        .setRequired(true)
        .addChoices(
                    { name: 'SFW (general and sensitive)', value: '-rating:explicit -rating:questionable' },
                    { name: 'NSFW (questionable and explicit)', value: '-rating:general -rating:sensitive' },
                    { name: 'General', value: 'rating:general' },
                    { name: 'Sensitive', value: 'rating:sensitive' },
                    { name: 'Questionable', value: 'rating:questionable' },
                    { name: 'Explicit', value: 'rating:explicit' },
                ))     
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
        let tags = interaction.options.getString('tags');
        let rating = interaction.options.getString('rating');
        let sort = interaction.options.getString('sort');
            let parentChannel;
            let response;
            await interaction.deferReply()
            tags = " "+ tags + " " + sort

            tags = tags.replace(/ mpe/gi, 'mass_production_eva ');
            tags = tags.replace(/ eva01/gi, 'eva_01 ');
            tags = tags.replace(/ eva02/gi, 'eva_02 ');
            tags = tags.replace(/ eva03/gi, 'eva_03 ');
            tags = tags.replace(/ eva04/gi, 'eva_04 ');
            tags = tags.replace(/ eva05/gi, 'eva_05 ');
            tags = tags.replace(/ eva06/gi, 'eva_06 ');
            tags = tags.replace(/ eva08/gi, 'eva_08 ');
            tags = tags.replace(/ eva09/gi, 'eva_09 ');
            tags = tags.replace(/ eva13/gi, 'eva_13 ');
            tags = tags.replace(/ lilith/gi, 'lilith_(evangelion) ');
            tags = tags.replace(/ rei_lilith/gi, 'lilith_(ayanami_rei) ');
            
            tags = tags.replace(/ shinji/gi, 'ikari_shinji ');
            tags = tags.replace(/ rei/gi, 'ayanami_rei ');
            tags = tags.replace(/ asuka/gi, 'asuka_langley_souryuu ');
            tags = tags.replace(/ toji/gi, 'suzuhara_touji ');
            tags = tags.replace(/ touji/gi, 'suzuhara_touji ');
            tags = tags.replace(/ mari/gi, 'makinami_mari_illustrious ');
            tags = tags.replace(/ kaworu/gi, 'nagisa_kaworu ');

            tags = tags.replace(/ gendo/gi, 'ikari_gendou ');
            tags = tags.replace(/ fuyutsuki/gi, 'fuyutsuki_kouzou ');
            tags = tags.replace(/ misato/gi, 'katsuragi_misato ');
            tags = tags.replace(/ ritsuko/gi, 'akagi_ritsuko ');
            tags = tags.replace(/ kaji/gi, 'kaji_ryouji ');
            tags = tags.replace(/ hyuga/gi, 'hyuuga_makoto ');
            tags = tags.replace(/ hyuuga/gi, 'hyuuga_makoto ');
            tags = tags.replace(/ maya/gi, 'ibuki_maya ');
            tags = tags.replace(/ aoba/gi, 'aoba_shigeru ');

            tags = tags.replace(/ kensuke/gi, 'aida_kensuke ');
            tags = tags.replace(/ hikari/gi, 'horaki_hikari ');

            tags = tags.replace(/ naoko/gi, 'akagi_naoko ');
            tags = tags.replace(/ yui/gi, 'ikari_yui ');
            tags = tags.replace(/ kyoko/gi, 'soryu_kyouko_zeppelin ');
            tags = tags.replace(/ kyouko/gi, 'soryu_kyouko_zeppelin ');
            tags = tags.replace(/ keel/gi, 'keel_lorenz ');
            tags = tags.replace(/ lorenz/gi, 'keel_lorenz ');
            tags = tags.replace(/ penpen/gi, 'penpen ');
            tags = tags.replace(/ pen2/gi, 'penpen ');

            tags = tags.replace(/ sumire/gi, 'nagara_sumire ');
            tags = tags.replace(/ koji/gi, 'takao_kouji ');
            tags = tags.replace(/ kouji/gi, 'takao_kouji ');
            tags = tags.replace(/ hideki/gi, 'tama_hideki ');
            tags = tags.replace(/ midori/gi, 'kitakami_midori ');
            tags = tags.replace(/ sakura/gi, 'suzuhara_sakura ');

            tags = tags.replace(/ kaede/gi, 'agano_kaede ');
            tags = tags.replace(/ satsuki/gi, 'ooi_satsuki ');
            tags = tags.replace(/ aoi/gi, 'mogami_aoi ');
            tags = tags.replace(/ mana/gi, 'kirishima_mana ');
            tags = tags.replace(/ mayumi/gi, 'yamagishi_mayumi ');

            //TAGS DA ESCLUDERE
            tags = tags.replace(/-mpe/gi, '-mass_production_eva ');
            tags = tags.replace(/-eva01/gi, '-eva_01 ');
            tags = tags.replace(/-eva02/gi, '-eva_02 ');
            tags = tags.replace(/-eva03/gi, '-eva_03 ');
            tags = tags.replace(/-eva04/gi, '-eva_04 ');
            tags = tags.replace(/-eva05/gi, '-eva_05 ');
            tags = tags.replace(/-eva06/gi, '-eva_06 ');
            tags = tags.replace(/-eva08/gi, '-eva_08 ');
            tags = tags.replace(/-eva09/gi, '-eva_09 ');
            tags = tags.replace(/-eva13/gi, '-eva_13 ');
            tags = tags.replace(/-lilith/gi, '-lilith_(evangelion) ');
            tags = tags.replace(/-rei_lilith/gi, '-lilith_(ayanami_rei) ');
            
            tags = tags.replace(/-shinji/gi, '-ikari_shinji ');
            tags = tags.replace(/-rei/gi, '-ayanami_rei ');
            tags = tags.replace(/-asuka/gi, '-asuka_langley_souryuu ');
            tags = tags.replace(/-toji/gi, '-suzuhara_touji ');
            tags = tags.replace(/-touji/gi, '-suzuhara_touji ');
            tags = tags.replace(/-mari/gi, '-makinami_mari_illustrious ');
            tags = tags.replace(/-kaworu/gi, '-nagisa_kaworu ');

            tags = tags.replace(/-gendo/gi, '-ikari_gendou ');
            tags = tags.replace(/-fuyutsuki/gi, '-fuyutsuki_kouzou ');
            tags = tags.replace(/-misato/gi, '-katsuragi_misato ');
            tags = tags.replace(/-ritsuko/gi, '-akagi_ritsuko ');
            tags = tags.replace(/-kaji/gi, '-kaji_ryouji ');
            tags = tags.replace(/-hyuga/gi, '-hyuuga_makoto ');
            tags = tags.replace(/-hyuuga/gi, '-hyuuga_makoto ');
            tags = tags.replace(/-maya/gi, '-ibuki_maya ');
            tags = tags.replace(/-aoba/gi, '-aoba_shigeru ');

            tags = tags.replace(/-kensuke/gi, '-aida_kensuke ');
            tags = tags.replace(/-hikari/gi, '-horaki_hikari ');

            tags = tags.replace(/-naoko/gi, '-akagi_naoko ');
            tags = tags.replace(/-yui/gi, '-ikari_yui ');
            tags = tags.replace(/-kyoko/gi, '-soryu_kyouko_zeppelin ');
            tags = tags.replace(/-kyouko/gi, '-soryu_kyouko_zeppelin ');
            tags = tags.replace(/-keel/gi, '-keel_lorenz ');
            tags = tags.replace(/-lorenz/gi, '-keel_lorenz ');
            tags = tags.replace(/-penpen/gi, '-penpen ');
            tags = tags.replace(/-pen2/gi, '-penpen ');

            tags = tags.replace(/-sumire/gi, '-nagara_sumire ');
            tags = tags.replace(/-koji/gi, '-takao_kouji ');
            tags = tags.replace(/-kouji/gi, '-takao_kouji ');
            tags = tags.replace(/-hideki/gi, '-tama_hideki ');
            tags = tags.replace(/-midori/gi, '-kitakami_midori ');
            tags = tags.replace(/-sakura/gi, '-suzuhara_sakura ');

            tags = tags.replace(/-kaede/gi, '-agano_kaede ');
            tags = tags.replace(/-satsuki/gi, '-ooi_satsuki ');
            tags = tags.replace(/-aoi/gi, '-mogami_aoi ');
            tags = tags.replace(/-mana/gi, '-kirishima_mana ');
            tags = tags.replace(/-mayumi/gi, '-yamagishi_mayumi ');


            tags = tags.replace(/-rating:general/gi, '');
            tags = tags.replace(/-rating:sensitive/gi, '');
            tags = tags.replace(/-rating:questionable/gi, '');
            tags = tags.replace(/-rating:explicit/gi, '');

            tags = tags.replace(/rating:general/gi, '');
            tags = tags.replace(/rating:sensitive/gi, '');
            tags = tags.replace(/rating:questionable/gi, '');
            tags = tags.replace(/rating:explicit/gi, '');

            if(interaction.channel.nsfw == null){
                parentChannel = client.channels.cache.get(interaction.channel.parentId);
               
                if(!parentChannel.nsfw){
                    if(rating == '-rating:general -rating:sensitive' || rating == 'rating:questionable' || rating == 'rating:explicit'){
                        response = await interaction.followUp({ content: 'Solo se puede usar en canales NSFW', ephemeral: true });
                        return;
                    }else

                    tags = tags + " " + rating;

                    tags = tags.replace(/penis/gi, '-penis ');
                    tags = tags.replace(/completely_nude/gi, '-completely_nude ');
                    tags = tags.replace(/sex/gi, '-sex ');
                    tags = tags.replace(/futanari/gi, '-futanari ');

  
                    tags = tags.replace(/--penis/gi, '-penis ');
                    tags = tags.replace(/--completely_nude/gi, '-completely_nude ');
                    tags = tags.replace(/--sex/gi, '-sex ');
                    tags = tags.replace(/--futanari/gi, '-futanari ');

                    if(!tags.includes('-penis')){
                        tags = tags + " -penis "
                    }
                    if(!tags.includes('-completely_nude')){
                        tags = tags + " -completely_nude "
                    }
                    
                    if(!tags.includes('-sex')){
                        tags = tags + " -sex "
                    }
                    if(!tags.includes('-futanari')){
                        tags = tags + " -futanari "
                    }
                   
                }else{
                    tags = tags + " " + rating;
                }
            }else{
                if(!interaction.channel.nsfw){ 
                    
                    if(rating == '-rating:general -rating:sensitive' || rating == 'rating:questionable' || rating == 'rating:explicit'){
                        response = await interaction.followUp({ content: 'Solo se puede usar en canales NSFW', ephemeral: true });
                        return;
                    }else

                    tags = tags + " " + rating;

                    tags = tags.replace(/penis/gi, '-penis ');
                    tags = tags.replace(/completely_nude/gi, '-completely_nude ');
                    tags = tags.replace(/sex/gi, '-sex ');
                    tags = tags.replace(/futanari/gi, '-futanari ');

  
                    tags = tags.replace(/--penis/gi, '-penis ');
                    tags = tags.replace(/--completely_nude/gi, '-completely_nude ');
                    tags = tags.replace(/--sex/gi, '-sex ');
                    tags = tags.replace(/--futanari/gi, '-futanari ');

                    if(!tags.includes('-penis')){
                        tags = tags + " -penis "
                    }
                    if(!tags.includes('-completely_nude')){
                        tags = tags + " -completely_nude "
                    }
                    
                    if(!tags.includes('-sex')){
                        tags = tags + " -sex "
                    }
                    if(!tags.includes('-futanari')){
                        tags = tags + " -futanari "
                    }

                }else{
                    tags = tags + " " + rating;
                }
            }
        
            //response = await interaction.deferReply()
        let date1;
        let linkImg = "";
   
        let listaGel = new ArrayList();
       GelbooruClient = new Gelbooru(tags);

     
       try {
        await GelbooruClient.getPosts(tags, 50, 0).then(post => { // get random post
            
            for(i = 0; i <= (post.length-1); i++){
           
               listaGel.add(new lista(post[i].id,new Date(""+post[i].created_at),post[i].file_url))
                
            }
           }); 

        
       }catch(error) {
           console.log(error);
           return;
         }
             
         
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
        
        let imgasushin;
        try{   
         imgasushin = new EmbedBuilder()
        .setTitle("SEARCH")
       .setColor("Random")
       .setTimestamp(listaGel.get(0).date)
       .setDescription("https://gelbooru.com/index.php?page=post&s=view&id="+listaGel.get(0).id)
       .setImage(listaGel.get(0).link)
       .setFooter({ text:(buttonstatus + 1) + "/" + (maxStatus + 1)})
    }catch(error){
        console.log(error);
        response = await interaction.followUp("Texto no valido o no se encontraron imagenes");
        return;
    } 

       console.log(tags)
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
            .setTitle("SEARCH")
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
            .setTitle("SEARCH")
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