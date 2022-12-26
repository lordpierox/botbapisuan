const {Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, ActivityType } = require('discord.js');
const ArrayList = require('arraylist');

function snipeado(chan, user, cont,url, date) {
    this.chan = chan;
    this.user = user;
    this.cont = cont;
    this.url = url;
    this.date = date;
  }

module.exports = {
    name: 'messageDelete',
    on: true,
    async execute(client, message, messageDelete) {
        try{

       

        
            let imgurl;
        try{
        if (client.channel.type === 'DM') return;
        if (client.author == 'bot') return;
        }catch(error){
            console.log(error);
        }


        try{
            if(client.attachments.first().contentType == 'image/jpeg' || client.attachments.first().contentType == 'image/png'){
                
               
                imgurl = client.attachments.first().url;
            }
        }catch(error){
          
        }
   
            
        
       
        if(client.content == ''){
            client.content = ' ';
        }
        global.snipe.add(new snipeado(client.channel.id,client.author.id,client.content,imgurl,client.createdTimestamp))
        
        //global.snipe.add(client.channel.id, client.content);
        //global.snipe_user.add(client.channel.id, client.author.id);
        

    }catch(error){
        console.log(error);
    }
      
    },
};
