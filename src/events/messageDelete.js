const {Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, ActivityType } = require('discord.js');
const ArrayList = require('arraylist');

function snipeado(chan, user, cont,url, date) {
    this.chan = chan;
    this.user = user;
    this.cont = cont;
    this.url = url;
    this.date = date;
  }
  function snipeadobot(chan, user, cont,url, date, embed) {
    this.chan = chan;
    this.user = user;
    this.cont = cont;
    this.url = url;
    this.date = date;
    this.embed = embed;
  }  

module.exports = {
    name: 'messageDelete',
    on: true,
    async execute(client, message, messageDelete) {
        try{

            let imgurl;
            let is_a_bot = false;
        try{
        if (client.channel.type === 'DM') return;
        if (client.author.bot){
            is_a_bot = true;
        };
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
        if(is_a_bot){
            console.log("DELETED! User: " + client.author.username + ", Message: " + client.content);
            global.snipe_bot.add(new snipeadobot(client.channel.id,client.author.id,client.content,imgurl,client.createdTimestamp,client.embeds))
        
        }else{
        console.log("DELETED! User: " + client.author.username + ", Message: " + client.content);
        global.snipe.add(new snipeado(client.channel.id,client.author.id,client.content,imgurl,client.createdTimestamp))
        }
        console.log()
    }catch(error){
        console.log(error);
    }
      
    },
};
