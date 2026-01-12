const { ActivityType } = require('discord.js');
const WebServer = require('../web/server');

module.exports = {
    name: 'clientReady',  // Cambiado de 'ready' a 'clientReady'
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
        });
        
        // Iniciar WebServer DESPUÉS de que el bot esté listo
        try {
            const webServer = new WebServer(8080, client);
            webServer.start();
        } catch (error) {
            console.error('\n❌ Error iniciando WebServer:', error.message);
            console.log('   El bot sigue funcionando sin web...\n');
        }
    },
};
