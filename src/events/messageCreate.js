const {Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, ActivityType } = require('discord.js');

//const fetch = require('node-fetch');
//API_URL = 'https://api-inference.huggingface.co/models/r3dhummingbird/DialoGPT-medium-joshua';
//API_URL = 'https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4';

module.exports = {
    name: 'messageCreate',
    on: true,
    async execute(client, message, messageCreate) {
        if (client.type == 20 && client.channel.id == "1058231916601556992" && client.interaction.commandName == "animals cat") {
            //console.log(client)
            try{
            const guild = await message.guilds.cache.get(client.guildId);
      	    const member = await guild.members.cache.get(client.interaction.user.id);

            
            member.roles.add("1075621882591715419");
            setTimeout(() => member.roles.remove("1075621882591715419"), 10000);
            }catch(error){
                console.log(error)
            }
            
        }
        


       
    
    },
};
