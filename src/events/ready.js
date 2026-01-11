const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('\n========================================');
        console.log('🤖 BOT CONECTADO A DISCORD');
        console.log('========================================');
        console.log(`Usuario: ${client.user.tag}`);
        console.log(`ID: ${client.user.id}`);
        console.log(`Servidores: ${client.guilds.cache.size}`);
        console.log('========================================\n');

        client.user.setPresence({
            activities: [{ 
                name: "Dominio Total del Mundo! | /info",
                type: ActivityType.Competing
            }],
            status: 'dnd',
        });

        console.log('📊 Lista de servidores:');
        client.guilds.cache.forEach(guild => {
            console.log(`  ├─ ${guild.name} (${guild.id})`);
        })    
    },
};
