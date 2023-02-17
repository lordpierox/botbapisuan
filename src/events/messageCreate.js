const {Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, ActivityType } = require('discord.js');

//const fetch = require('node-fetch');
//API_URL = 'https://api-inference.huggingface.co/models/r3dhummingbird/DialoGPT-medium-joshua';
//API_URL = 'https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4';

module.exports = {
    name: 'messageCreate',
    on: true,
    async execute(client, message, messageCreate) {
        if (client.type == 20 && client.channel.id == "1044118221881606224" && client.interaction.commandName == "top") {
            //console.log(client)
            try{
            console.log("bump detectado")
            var member;
            const guild = await message.guilds.cache.get(client.guildId);
      	    
            await guild.members.cache.forEach(member => {

                member.roles.remove("1075621882591715419");
                });
            
            member = await guild.members.cache.get(client.interaction.user.id);
            if(member == null){
                console.log("member null")
            }{

            }
            
            member.roles.add("1075621882591715419");
            setTimeout(() => member.roles.remove("1075621882591715419"), 7200000);
            }catch(error){
                console.log(error)
            }
            
        }
        


       
    
    },
};
