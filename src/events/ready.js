const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log('Ready!');

        client.user.setPresence({
            activities: [{ name: "Dominio Total del Mundo! | /info" ,
            type: ActivityType.Competing}],
            status: 'dnd',
          });

          var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('wowowowowoowwoowowowowowowowowowowoowowowoowowowoowowo');
  res.end();
}).listen(8080);

client.guilds.cache.forEach(guild => {
  console.log(`${guild.name} | ${guild.id}`);
})    


    },
};