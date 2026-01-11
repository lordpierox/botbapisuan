const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('🤖 Bot ready! Conectado como:', client.user.tag);

        client.user.setPresence({
            activities: [{ name: "Dominio Total del Mundo! | /info" ,
            type: ActivityType.Competing}],
            status: 'dnd',
          });

        console.log(`📊 Bot en ${client.guilds.cache.size} servidores`);
        client.guilds.cache.forEach(guild => {
            console.log(`  ├─ ${guild.name} (${guild.id})`);
        })    
    },
};
