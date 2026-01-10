const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const WebServer = require('../web/server');

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

        // Iniciar servidor web con estructura modular
        const webServer = new WebServer(8080);
        webServer.start();

        client.guilds.cache.forEach(guild => {
            console.log(`${guild.name} | ${guild.id}`);
        })    
    },
};
