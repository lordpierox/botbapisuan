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

        // El servidor web ya se inició en index.js ANTES de Discord
        // para pasar los health checks de Koyeb inmediatamente

        client.guilds.cache.forEach(guild => {
            console.log(`${guild.name} | ${guild.id}`);
        })    
    },
};
