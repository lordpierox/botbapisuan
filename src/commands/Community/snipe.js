const { SlashCommandBuilder } = require('@discordjs/builders');
const ArrayList = require('arraylist');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data:new SlashCommandBuilder()
    .setName('snipe')
    .setDescription('Recupera los ultimos 5 mensajes eliminados')
    .addBooleanOption(option =>
		option.setName('ephemeral')
			.setDescription('Respuesta secreta')),
    async execute(interaction, client)  {

        let ephemeral = interaction.options.getBoolean('ephemeral');
        if(ephemeral == null){
            ephemeral = false;
        }
        let comsnipe = global.snipe.clone();

        let messArray = new ArrayList();
        let userArray = new ArrayList();
        let userAvatar = new ArrayList();
        let messDate = new ArrayList();
        let imgArray = new ArrayList();
       
        let userfirst;
        let userfirstavatar;
        try{
        for(i = ( comsnipe.length - 1 ); i >= 0; i--){
            if(messArray.length >= 5){
                break;
            }
            if(comsnipe.get(i).chan == interaction.channel.id){
                messArray.add(comsnipe.get(i).cont);
                userfirst = client.users.cache.get(comsnipe.get(i).user).tag;
                userfirstavatar = client.users.cache.get(comsnipe.get(i).user).avatarURL();
                messDate.add(comsnipe.get(i).date)
                userAvatar.add(userfirstavatar);
                userArray.add(userfirst);
                imgArray.add(comsnipe.get(i).url)
            }
            
        }   
    }catch(error){
        console.log(error);
    }

        const embed0 = new EmbedBuilder()
        .setColor('Random')
        .setTitle('TITULO')
        .setDescription('INSERTAR UN TEXTO:clown: ')



        const embed1 = new EmbedBuilder()
        .setColor('Random')
        .setTitle('' +userArray.get(0))
        .setDescription('' + messArray.get(0))
        .setThumbnail(userAvatar.get(0))
        .setFooter({ text:'1 / ' + messArray.length})
        .setImage(imgArray.get(0))
        .setTimestamp(messDate.get(0));
    

        const embed2 = new EmbedBuilder()
        .setColor('Random')
        .setTitle('' +userArray.get(1))
        .setDescription('' + messArray.get(1))
        .setThumbnail(userAvatar.get(1))
        .setImage(imgArray.get(1))
        .setFooter({ text:'2 / ' + messArray.length});

        const embed3 = new EmbedBuilder()
        .setColor('Random')
        .setTitle('' +userArray.get(2))
        .setDescription('' + messArray.get(2))
        .setThumbnail(userAvatar.get(2))
        .setImage(imgArray.get(2))
        .setFooter({ text:'3 / ' + messArray.length});

        const embed4 = new EmbedBuilder()
        .setColor('Random')
        .setTitle('' +userArray.get(3))
        .setDescription('' + messArray.get(3))
        .setThumbnail(userAvatar.get(3))
        .setImage(imgArray.get(3))
        .setFooter({ text:'4 / ' + messArray.length});

        const embed5 = new EmbedBuilder()
        .setColor('Random')
        .setTitle('' +userArray.get(4))
        .setDescription('' + messArray.get(4))
        .setThumbnail(userAvatar.get(4))
        .setImage(imgArray.get(4))
        .setFooter({ text:'5 / ' + messArray.length});


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


        let buttonstatus = 1;
        const maxStatus = messArray.length;
        let response;

        if(messArray.length <= 0){
            response = await interaction.reply({ embeds: [embed0],ephemeral: ephemeral});
            return;
        }

        if(messArray.length <= 1){
             response = await interaction.reply({ embeds: [embed1],ephemeral: ephemeral});
            return;
        }else{
             response = await interaction.reply({ embeds: [embed1], components: [button],ephemeral: ephemeral});
        }
  
        //await interaction.reply({content:'channel:' + chan1 +'  user: '+ userfirst.username + ' message: '+ message1 ,ephemeral: false})



        const collector = await response.createMessageComponentCollector();
		
		collector.on('collect', async i => {
            try{
			if(i.customId === 'next') {
				if (i.user.id !== interaction.user.id){
					return await i.reply({content: `Solo ${interaction.user.tag} puede usar el comando`, ephemeral:true});
				}
				
                
				buttonstatus++;
                
                if(buttonstatus > maxStatus){
                    buttonstatus = 1;
                }

                if(buttonstatus == 1){
                    return await i.update({ embeds: [embed1], components: [button] })

                }
                if(buttonstatus == 2){
                    return await i.update({ embeds: [embed2], components: [button] })
                    
                    
                }
                if(buttonstatus == 3){
                    return await i.update({ embeds: [embed3], components: [button] })
                }
                if(buttonstatus == 4){
                    return await i.update({ embeds: [embed4], components: [button] })
                }
                if(buttonstatus == 5){
                    return await i.update({ embeds: [embed5], components: [button] })
                }
				
			}

			if(i.customId === 'prev') {
				if (i.user.id !== interaction.user.id){
					return await i.reply({content: `Solo ${interaction.user.tag} puede usar el comando`, ephemeral:true});
				}
				
               
                
				buttonstatus--;
                
                if(buttonstatus < 1){
                    buttonstatus = maxStatus;
                }

               if(buttonstatus == 1){
                return await i.update({ embeds: [embed1], components: [button] })

                }
                if(buttonstatus == 2){
                    return await i.update({ embeds: [embed2], components: [button] })
                    
                }
                if(buttonstatus == 3){
                    return await i.update({ embeds: [embed3], components: [button] })
                }
                if(buttonstatus == 4){
                    return await i.update({ embeds: [embed4], components: [button] })
                }
                if(buttonstatus == 5){
                    return await i.update({ embeds: [embed5], components: [button] })
                }

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
