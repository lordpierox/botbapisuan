const { ActivityType } = require('discord.js');
const WebServer = require('../web/server');
const http = require('http');

module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log('\n========================================')
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
            
            // Self-ping cada 50 minutos para evitar Koyeb auto-sleep
            console.log('\n🏓 Self-ping activado: cada 50 minutos');
            setInterval(() => {
                const options = {
                    hostname: 'localhost',
                    port: 8080,
                    path: '/',
                    method: 'GET',
                    timeout: 5000
                };
                
                const req = http.request(options, (res) => {
                    console.log(`🏓 Self-ping exitoso [${new Date().toLocaleTimeString('es-ES')}]`);
                });
                
                req.on('error', (error) => {
                    console.error('❌ Self-ping falló:', error.message);
                });
                
                req.on('timeout', () => {
                    req.destroy();
                    console.error('⏱️ Self-ping timeout');
                });
                
                req.end();
            }, 50 * 60 * 1000); // 50 minutos
            
        } catch (error) {
            console.error('\n❌ Error iniciando WebServer:', error.message);
            console.log('   El bot sigue funcionando sin web...\n');
        }
    },
};
