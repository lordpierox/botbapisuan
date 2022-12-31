const sagiri = require('sagiri')
const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder, Client } = require('discord.js')

const sagiriclient = sagiri("a10473b382ec6bd5a8187816dfc48b3226a4a96b");
const nhentai = require('nhentai');

const extractUrls = require("extract-urls");

module.exports = {

    data:new SlashCommandBuilder()
    .setName('saucelink')
    .setDescription('Busca la imagen en sauceNAO')
    .addStringOption(option => option
        .setName('sauce')
        .setDescription('link de la imagen')
        .setRequired(true)),
    async execute(interaction, client)  {
        
        let img = interaction.options.getString("sauce");

        if(!interaction.channel.nsfw){ 
            interaction.reply({content: "Este comando sólo se puede utilizar en los canales marcados como nsfw.", ephemeral:true}); 
            return; 
        }
       

        //img.forEach(async Attachment => {
            try {
                await interaction.deferReply();
                
                const results = await sagiriclient(img);
                const arara = new EmbedBuilder()
                    .setColor('#DC143C')
                    .setTitle(`SAUCE`)
                    .setDescription(`Link: ${results[0].url}\nsimilarity: ${results[0].raw.header.similarity}`)
                    .setURL(results[0].raw.data.url)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    /*.addFields({
                        name: 'Source',
                        value: `${results[0].raw.data.source}`
                    }, {
                        name: '\u200B',
                        value: '\u200B'
                    }, {
                        name: 'Similarity',
                        value: `${results[0].raw.header.similarity}`,
                        inline: true
                    }, {
                        name: 'Part/EP',
                        value: `${results[0].raw.data.part}`,
                        inline: true
                    }, {
                        name: '\u200B',
                        value: '\u200B'
                    }, {
                        name: 'Release',
                        value: `${results[0].raw.data.year}`,
                        inline: true
                    }, {
                        name: 'Time Stamp',
                        value: `${results[0].raw.data.est_time}`,
                        inline: true
                    }, )*/
                    .setImage(results[0].raw.header.thumbnail)
                    //.setFooter('Requested by: suki');
                    interaction.followUp({ embeds: [arara] })
            } catch (e) {
                interaction.followUp({content: "Error", ephemeral:true}); 
                console.log(e);
                return; 

            }
        //})
/*
            try{
             await interaction.deferReply()
            
             let imgasurei = new EmbedBuilder()
                   .setTitle("SAUCE")
                  .setColor("Random")
                  .setDescription("COSAAA")
                  //.setImage()
                  .setFooter({ text:"SukiBot"})
         
             interaction.followUp({ embeds: [imgasurei] })
            }catch(error) {
                console.log(error);
                interaction.followUp({content: "Error", ephemeral:true}); 
                 return; 
              }*/
             },

         }